import { createSignal, onMount, Switch, Match, JSXElement} from "solid-js";
import api from '../api';

export function SetupMFAModal(props: {isOpen: boolean, onClose: () => void}): JSXElement {
  const [step, setStep] = createSignal(1);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div class={`modal ${props.isOpen ? "modal-open" : ""}`}>
      <div class="modal-box">
        <Switch>
          <Match when={step() === 1}>
            <QRCodeStep nextStep={nextStep} />
          </Match>

          <Match when={step() === 2}>
            <div>
              <h3 class="font-bold text-lg">Step 2: Verify the setup by filling in the 2FA code</h3>
              <p class="py-4">Review and submit your information.</p>
              <div class="modal-action">
                <button class="btn btn-outline" onClick={prevStep}>
                  Previous
                </button>
                <button class="btn btn-success" onClick={() => props.onClose()}>
                  Submit
                </button>
              </div>
            </div>
          </Match>
        </Switch>
        <button class="modal-backdrop" onClick={() => props.onClose()}></button>
      </div>
    </div>
  );
}


function QRCodeStep(props: {nextStep: () => void}): JSXElement {
  const [qrCode, setQrCode] = createSignal<string | null>(null)

  const fetchQRCode = () => {
    api.get('/generate_totp_secret').then((response) => {
      setQrCode(response.data.qr_code);
    })
  }

  onMount(() => {
    fetchQRCode();
  })

  return (
    <div>
      <h3 class="font-bold text-xl">Step 1: Scan QR code with your authenticator app</h3>

      <div class="my-8">
        <img src={`data:image/png;base64,${qrCode()}`} alt="TOTP QR Code" />
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" onClick={props.nextStep}>
          Next
        </button>
      </div>
    </div>
  )
}
