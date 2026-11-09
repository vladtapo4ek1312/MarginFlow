const PATHS = {
  overview: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z',
  calculator:
    'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 3v3h8V6H8Zm0 6v2h2v-2H8Zm3 0v2h2v-2h-2Zm3 0v2h2v-2h-2Zm-6 4v2h2v-2H8Zm3 0v2h2v-2h-2Zm3 0v2h2v-2h-2Z',
  products: 'M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Zm8 2.2L6.3 6.6 12 5.3l5.7 1.3L12 9.7Zm-6 1v5l5 2.8v-5l-5-2.8Zm7 7.8 5-2.8v-5l-5 2.8v5Z',
  plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z',
  download: 'M11 4h2v8.2l3.3-3.3 1.4 1.4L12 16l-5.7-5.7 1.4-1.4 3.3 3.3V4ZM5 18h14v2H5v-2Z',
  search:
    'M10.5 4a6.5 6.5 0 0 1 5.2 10.4l4.4 4.4-1.4 1.4-4.4-4.4A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z',
  edit: 'm15.2 4.2 4.6 4.6L9 19.6H4.4V15L15.2 4.2Zm0 2.8L6.4 15.8v1.8h1.8L17 8.8 15.2 7Z',
  trash: 'M9 3h6l1 2h4v2H4V5h4l1-2ZM6 9h12l-1 12H7L6 9Zm3 2v8h2v-8H9Zm4 0v8h2v-8h-2Z',
  lock: 'M8 10V8a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h4V8a2 2 0 1 0-4 0v2Z',
  alert: 'M12 3 2 20h20L12 3Zm-1 6h2v6h-2V9Zm0 7h2v2h-2v-2Z',
  check: 'm9.5 16.2-4.2-4.2-1.4 1.4 5.6 5.6L21 7.5l-1.4-1.4-10.1 10.1Z',
  close: 'm6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z',
  info: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-1 7h2v6h-2v-6Zm0-4h2v2h-2V7Z',
  chat: 'M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1Zm1 2v10.9L8.3 15H19V6H5Zm3 3h8v2H8V9Zm0 3h5v2H8v-2Z',
  copy: 'M8 3h11a1 1 0 0 1 1 1v13h-2V5H8V3ZM5 7h10a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm1 2v10h8V9H6Z',
  arrowRight:'M13.3 5.3 20 12l-6.7 6.7-1.4-1.4 4.3-4.3H4v-2h12.2l-4.3-4.3 1.4-1.4Z',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
