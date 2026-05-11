import { JSXElement, ParentProps } from 'solid-js'
import { A } from '@solidjs/router'

import { AppLogo } from './auth-icons'
import { useLocale } from '../context/LocaleProvider'

interface MarketingAuthLayoutProps extends ParentProps {
  /** Right-side content of the topbar (e.g. "already have an account?" link, invite badge). */
  topbarRight?: JSXElement
  /** Optional override for the left-side logo block. */
  logo?: JSXElement
  /** Headline content displayed on the marketing (left) side. */
  headline: JSXElement
  /** Subtitle text rendered below the headline. */
  subtitle: JSXElement
  /** Right-side panel content (form, header, etc.). */
  formPanel: JSXElement
}

/**
 * Two-column marketing/auth layout used by the public Login and Register pages.
 * The left column shows branding/headline, the right column hosts the form.
 */
export function MarketingAuthLayout(
  props: MarketingAuthLayoutProps
): JSXElement {
  const { t } = useLocale()

  return (
    <div class="register-page">
      <div class="register-topbar">
        <A href="/login" class="register-logo">
          {props.logo ?? (
            <>
              <div class="register-logo-mark">
                <AppLogo />
              </div>
              <span class="register-logo-text">{t('my_solid_app')}</span>
            </>
          )}
        </A>

        {props.topbarRight}
      </div>

      <div class="register-main">
        <div class="register-split">
          <div class="register-left">
            <div class="register-left-inner">
              <h1 class="register-left-headline">{props.headline}</h1>
              <p class="register-left-sub">{props.subtitle}</p>
            </div>
          </div>

          <div class="register-right">{props.formPanel}</div>
        </div>
      </div>
    </div>
  )
}
