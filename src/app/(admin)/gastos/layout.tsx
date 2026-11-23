import{requireAdminPage}from"@/lib/page-auth";export default async function Layout({children}:{children:React.ReactNode}){await requireAdminPage();return children}
