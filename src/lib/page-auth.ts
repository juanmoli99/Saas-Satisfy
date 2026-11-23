import{redirect}from"next/navigation";import{currentUser}from"./auth";
export async function requireAdminPage(){const user=await currentUser();if(!user)redirect("/login");if(user.role==="SELLER")redirect("/dashboard");return user}
