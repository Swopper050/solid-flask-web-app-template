import {
  clearResponse,
  createForm,
  FieldArrayPath,
  FieldArrayProps,
  FieldPath,
  FieldPathValue,
  FieldProps,
  FieldValues,
  FormOptions,
  FormProps,
  FormStore,
  MaybeValue,
  PartialKey,
  reset,
  ResponseData,
  setResponse,
} from '@modular-forms/solid'
import { Accessor, createSignal, JSXElement, Setter } from 'solid-js'
import { getErrorMessage } from './api'

/**
 * TODO
 *
 */
export function createFormWithSubmit<
  TType extends FieldValues,
  TResponse extends ResponseData = undefined,
>(options: {
  action: (values: TType) => Promise<Response>
  onFinish?: (respone?: TResponse) => void | Promise<void>
  formOptions?: FormOptions<TType>
}): [
  FormStore<TType, TResponse>,
  (values: TType) => void,
  {
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
  },
  Setter<Partial<TType | undefined>>,
] {
  const [store, { Form, Field, FieldArray }] = createForm<TType, TResponse>(
    options.formOptions
  )

  const [data, setData] = createSignal<Partial<TType>>()

  const onSubmit = createSubmitHandler({
    form: store,
    action: options.action,
    onFinish: options.onFinish,
    additionalData: data,
  })

  return [store, onSubmit, { Form, Field, FieldArray }, setData]
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
