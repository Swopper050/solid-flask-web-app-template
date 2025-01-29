import { get } from '../api'

export interface BaseModelAttributes {
  id: number | null
}

export class BaseModel<TModelAttributes extends BaseModelAttributes> {
  apiUrl: string = ''
  attrs: TModelAttributes

  constructor(attrs: TModelAttributes) {
    this.attrs = attrs
  }

  get id(): number | null {
    return this.attrs.id
  }

  get<K extends keyof TModelAttributes>(key: K): TModelAttributes[K] {
    return this.attrs[key]
  }

  set<K extends keyof TModelAttributes>(key: K, value: TModelAttributes[K]) {
    this.attrs[key] = value
  }

  async fetch() {
    this.updateAttributesWithResult(get(`api/${this.apiUrl}/${this.attrs.id}`))
  }

  async updateAttributesWithResult(request: Promise<Response>) {
    request.then((response) => {
      if (response.ok) {
        response.json().then((data: TModelAttributes) => {
          this.attrs = data
        })
      }
    })
  }

  clone(): this {
    const clone = new (this.constructor as new () => this)()
    Object.assign(clone, this)
    return clone
  }
}
