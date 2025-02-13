import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // カスタムカラーがあれば追加
      },
      fontFamily: {
        // カスタムフォントがあれば追加
      },
    },
  },
  plugins: [],
}

export default config
