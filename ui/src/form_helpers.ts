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
 * The form state can be used to keep track of a piece of data for a form.
 * It provides the sate of the form read and write access to the form data
 * bypassing user input as wel as an onSubmit callback that should be called
 * when the form is submitted.
 *
 */
interface FormState<TType extends FieldValues, TResponse extends ResponseData> {
  /**
   * The form state gives access to information about the state of the forms data.
   */
  state: FormStore<TType, TResponse>
  /**
   * The callback that will be called when the form is submitted by the user.
   */
  onSubmit: (values: TType) => void
  /*
   * A setter to for write access to the data bypassing user input.
   */
  setter: Setter<Partial<TType | undefined>>
  accessor: Accessor<PartialValues<TType>>
  /*
   * The form components
   */
  components: {
    Form: (props: Omit<FormProps<TType, TResponse>, 'of'>) => JSXElement
    Field: <TFieldName extends FieldPath<TType>>(
      props: FieldPathValue<TType, TFieldName> extends MaybeValue<string>
        ? PartialKey<
            Omit<FieldProps<TType, TResponse, TFieldName>, 'of'>,
            'type'
          >
        : Omit<FieldProps<TType, TResponse, TFieldName>, 'of'>
    ) => JSXElement
    FieldArray: <TFieldArrayName extends FieldArrayPath<TType>>(
      props: Omit<FieldArrayProps<TType, TResponse, TFieldArrayName>, 'of'>
    ) => JSXElement
  }
}

/**
 *  Creates a from state
 *
 */
export function createFormState<
  TType extends FieldValues,
  TResponse extends ResponseData = undefined,
>(options: {
  action: (values: TType) => Promise<Response>
  onFinish?: (respone?: TResponse) => void | Promise<void>
  formOptions?: FormOptions<TType>
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
  })

  return {
    state,
    onSubmit,
    setter,
    accessor,
    components: { Form, Field, FieldArray },
  }
}

export function createSubmitHandler<
  TType extends FieldValues,
  TResponse extends ResponseData = undefined,
>(options: {
  form: FormStore<TType, TResponse>
  action: (values: TType) => Promise<Response>
  onFinish?: (response: TResponse | undefined) => void | Promise<void>
  additionalData?: Accessor<Partial<TType | undefined>>
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
    clearResponse(options.form)
    reset(options.form)
  }
}
