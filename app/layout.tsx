import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata:Metadata={title:{default:"知らなかった便利、見つけました。",template:"%s | 知らなかった便利、見つけました。"},description:"小さな面倒から、知らなかった便利を見つける発見Hub。"};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ja"><body><a className="skip" href="#main">本文へ</a><header><div className="shell bar"><Link className="brand" href="/">知らなかった便利、見つけました。</Link><nav aria-label="メイン"><Link href="/new">新着</Link><Link href="/search">探す</Link><Link href="/about">方針</Link></nav></div></header><div className="demo">開発用サンプルデータです。実在商品の購入を促すページではありません。</div><main id="main" className="shell">{children}</main><footer><div className="shell"><p>便利さを先に。リンクはそのあとに。</p><p><Link href="/disclosure">広告・アフィリエイト方針</Link></p></div></footer></body></html>}
