import { Translations } from '../context/I18nProvider'

export const dict: Translations = {
  hello_template: (name: string) => `Hallo ${name}`,
  login: 'Login',
  register: 'Registreer',
  to_the_app: 'Naar de applicatie',
  landing_page_this_is: 'Dit is ',
  landing_page_your: 'jouw ',
  landing_page_web_application: 'web applicatie.',
  landing_page_build: 'Je kan bouwen wat je maar wilt.',
  a_puppy: 'Een puppy!',
  want_to_show_puppies: "Wil je puppy's laten zien?",
  you_can: 'Dat kan!',
  preikestolen: 'Preikestolen',
  want_to_show_rocks: 'Wil je stenen laten zien?',
  someone_might_like_it: 'Misschien vind iemand dat wel leuk!',
}
