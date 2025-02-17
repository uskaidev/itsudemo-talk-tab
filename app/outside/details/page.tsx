import Link from 'next/link'

export default function OutsideDetailsPage() {
  return (
    <div className="w-full h-[800px] bg-[#FAFFD4] p-4 flex flex-col items-center justify-center overflow-hidden">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-center font-zen-maru-gothic">外出支援サービス</h1>
        <p className="text-xl text-center font-zen-maru-gothic">
          本サービスは実証実験中です。
          <br />
          外出支援サービスはサービス開始後に
          <br />
          提供させていただきます。
        </p>
        <Link
          href="/outside"
          className="mt-8 w-full max-w-md bg-[#276204] hover:bg-[#1E4A03] text-white py-3 rounded-xl text-lg font-bold transition-colors text-center font-zen-maru-gothic"
        >
          前のページにもどる
        </Link>
      </div>
    </div>
  )
}
