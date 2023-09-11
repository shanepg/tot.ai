import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Command } from "lucide-react";
import { GOOGLE_SCOPES, authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Metadata } from "next/types";
import router from "next/navigation";
import { google } from "googleapis";
import { useEffect } from "react";



export default async function AuthenticationPage() {
  const { data: session } =  getSession();

    if (session) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NEXTAUTH_URL + "/api/auth/callback/google"
      );

      oauth2Client.setCredentials({
        refresh_token: session.refreshToken,
        access_token: session.accessToken,
        token_type: "Bearer",
        id_token: session.idToken,
        scope: GOOGLE_SCOPES.join(" "),
      });

      const drive = google.drive({ version: "v3", auth: oauth2Client });
      drive.files.list({
        pageSize: 10,
        fields: "nextPageToken, files(id, name)",
      })
      .then(files => {
        console.log(files.data.files);
      })
      .catch(err => {
        // Handle any errors
      });
    }
  
  

  


  return (
    <>
      <div className="md:hidden">
        <Image src="/examples/authentication-light.png" width={1280} height={843} alt="Authentication" className="block dark:hidden" />
        <Image src="/examples/authentication-dark.png" width={1280} height={843} alt="Authentication" className="hidden dark:block" />
      </div>
      <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80)" }} />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Command className="mr-2 h-6 w-6" /> Acme Inc
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">&ldquo;This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before. Highly recommended!&rdquo;</p>
              <footer className="text-sm">Sofia Davis</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
              <a href="/api/auth/signin">Login with Google</a> 
            </div>
                     <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div> <pre>{JSON.stringify(session, null, 2)}</pre>
    </>
  );
  
}
