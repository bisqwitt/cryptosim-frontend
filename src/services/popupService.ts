import type { ToastServiceMethods } from 'primevue'

let toast: ToastServiceMethods | undefined

export function initPopupService(service: ToastServiceMethods) {
  toast = service
}

export function showError(message: string, suggestion: string) {
  toast?.add({
    severity: 'error',
    summary: message,
    detail: suggestion,
  })
}
