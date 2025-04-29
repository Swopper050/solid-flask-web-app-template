import {
  clearResponse,
  createForm,
  FieldArrayPath,
  FieldArrayProps,
  FieldPathValue,
  FieldProps,
  FieldValues,
  FormOptions,
  FormProps,
  FormStore,
  FieldPath,
  MaybeValue,
  PartialKey,
  reset,
  ResponseData,
  setResponse,
  getValues,
  PartialValues,
} from '@modular-forms/solid'
import {
  Accessor,
  createMemo,
  createSignal,
  JSXElement,
  Setter,
} from 'solid-js'
import { getErrorMessage } from './api'

/**
 * The form state interface that encapsulates all form-related functionality.
 * It provides access to the form's state, methods to manipulate the form data,
 * and components to build the form UI.
 *
 * @template TType The type of values the form handles
 * @template TResponse The type of response data returned after form submission
 */
interface FormState<TType extends FieldValues, TResponse extends ResponseData> {
  /**
   * The form store that provides access to the state of the form's data
   */
  state: FormStore<TType, TResponse>

  /**
   * The callback that will be called when the form is submitted by the user
   */
  onSubmit: (values: TType) => void

  /**
   * A setter for write access to the form data, bypassing user input
   */
  setter: Setter<Partial<TType | undefined>>

  /**
   * An accessor for reading the current form values
   */
  accessor: Accessor<PartialValues<TType>>

  /**
   * The form UI components used to build the form
   */
  components: {
    /**
     * The Form component that wraps the entire form
     */
    Form: (props: Omit<FormProps<TType, TResponse>, 'of'>) => JSXElement

    /**
     * The Field component used for individual form fields
     */
    Field: <TFieldName extends FieldPath<TType>>(
      props: FieldPathValue<TType, TFieldName> extends MaybeValue<string>
        ? PartialKey<
            Omit<FieldProps<TType, TResponse, TFieldName>, 'of'>,
            'type'
          >
        : Omit<FieldProps<TType, TResponse, TFieldName>, 'of'>
    ) => JSXElement

    /**
     * The FieldArray component used for array-type form fields
     */
    FieldArray: <TFieldArrayName extends FieldArrayPath<TType>>(
      props: Omit<FieldArrayProps<TType, TResponse, TFieldArrayName>, 'of'>
    ) => JSXElement
  }
}

/**
 * Creates a form state that encapsulates form functionality
 *
 * @param options.action - Function that handles form submission by sending data to the server
 * @param options.onFinish - Optional callback that runs after successful form submission
 * @param options.formOptions - Optional configuration options for the form
 * @returns FormState object with form state, submission handler, and helper components
 *
 * @example
 * ```tsx
 * type LoginForm = {
 *   email: string;
 *   password: string;
 * }
 *
 * const {
 *   components: { Form, Field },
 *   onSubmit,
 *   state
 * } = createFormState<LoginForm>({
 *   action: async (values) => {
 *     return await fetch('/api/login', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(values)
 *     });
 *   },
 *   onFinish: (response) => {
 *     if (response) {
 *       navigate('/dashboard');
 *     }
 *   }
 * });
 *
 * return (
 *   <Form onSubmit={onSubmit} class="login-form">
 *     <Field name="email" validate={[required("Email is required")]}>
 *       {(field, props) => (
 *         <TextInput
 *           {...props}
 *           label="Email"
 *           type="email"
 *           value={field.value}
 *           error={field.error}
 *         />
 *       )}
 *     </Field>
 *
 *     <Field name="password">
 *       {(field, props) => (
 *         <TextInput
 *           {...props}
 *           label="Password"
 *           type="password"
 *           value={field.value}
 *           error={field.error}
 *         />
 *       )}
 *     </Field>
 *
 *     <Button type="submit" disabled={state.submitting}>
 *       {state.submitting ? "Logging in..." : "Login"}
 *     </Button>
 *   </Form>
 * );
 * ```
 */
export function createFormState<
  TType extends FieldValues,
  TResponse extends ResponseData = undefined,
>(options: {
  action: (values: TType) => Promise<Response>
  onFinish?: (respone?: TResponse) => void | Promise<void>
  formOptions?: FormOptions<TType>
  resetOnFinish?: boolean
}): FormState<TType, TResponse> {
  const [state, { Form, Field, FieldArray }] = createForm<TType, TResponse>(
    options.formOptions
  )

  const [data, setter] = createSignal<Partial<TType>>()

  const accessor: Accessor<PartialValues<TType>> = createMemo(() =>
    getValues(state, { shouldActive: false })
  )

  const onSubmit = createSubmitHandler({
    form: state,
    action: options.action,
    onFinish: options.onFinish,
    additionalData: data,
    resetOnFinish:
      options.resetOnFinish === undefined ? true : options.resetOnFinish,
  })

  return {
    state,
    onSubmit,
    setter,
    accessor,
    components: { Form, Field, FieldArray },
  }
}

/**
 * Creates a submit handler function for a form
 *
 * @param options.form - The form store that manages form state
 * @param options.action - Function that processes form submission and sends data to server
 * @param options.onFinish - Optional callback to run after successful submission
 * @param options.additionalData - Optional accessor to merge additional data with form values
 * @returns A function that handles form submission
 */
export function createSubmitHandler<
  TType extends FieldValues,
  TResponse extends ResponseData = undefined,
>(options: {
  form: FormStore<TType, TResponse>
  action: (values: TType) => Promise<Response>
  onFinish?: (response: TResponse | undefined) => void | Promise<void>
  additionalData?: Accessor<Partial<TType | undefined>>
  resetOnFinish?: boolean
}): (values: TType) => void {
  return async (values: TType) => {
    let merged = values
    if (options.additionalData !== undefined) {
      merged = { ...options.additionalData(), ...values }
    }

    const response = await options.action(merged)
    const data = await response.json()

    if (response.status !== 200) {
      setResponse(options.form, {
        status: 'error',
        message: getErrorMessage(data),
      })

      return
    }

    setResponse(options.form, { status: 'success', data: data })

    await options.onFinish?.(options.form.response.data)

    if (options.resetOnFinish) {
      clearResponse(options.form)
      reset(options.form)
    }
  }
}
