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

export function showSuccess(message: string, detail: string) {
  toast?.add({
    severity: 'success',
    summary: message,
    detail,
    life: 3000,
  })
}
