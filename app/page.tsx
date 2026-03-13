// Le middleware next-intl redirige automatiquement / → /fr ou /en
// selon la langue du navigateur. Cette page ne devrait jamais être rendue.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/fr");
}
