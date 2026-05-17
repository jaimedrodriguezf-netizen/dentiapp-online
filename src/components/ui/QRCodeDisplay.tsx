import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  url: string
  size?: number
}

export default async function QRCodeDisplay({ url, size = 200 }: QRCodeDisplayProps) {
  const qrSvg = await QRCode.toString(url, {
    type: 'svg',
    width: size,
    margin: 1,
    color: {
      dark: '#1e40af',
      light: '#ffffff',
    },
  })

  return (
    <div
      className="inline-block rounded-xl bg-white p-3 shadow-md border border-gray-200"
      dangerouslySetInnerHTML={{ __html: qrSvg }}
    />
  )
}
