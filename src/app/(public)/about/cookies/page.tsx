import { H2 } from "@/components/ui/typography";
import Link from "next/link";

export default function CookiePage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-2">
      <H2>Cookie policy</H2>
      <p>Our website uses a cookie to allow you to sign in and remain signed in.</p>
      <p>
        The cookie is stored on your computer, and is an encrypted sequence of letters and numbers
        that allows us to sign you into the site. This is a Strictly necessary cookie that is
        required for the operation of the website. The cookie expires after 14 days.
      </p>
      <p>If you don't log in, we don't store any cookie on your computer.</p>
      <p>We don't use any analytical or performance cookies, or any functionality cookies.</p>
      <p>
        You can choose to enable or disable cookies in your internet browser. By default, most
        internet browsers accept cookies but this can be changed. However, if you use your browser
        settings to block all cookies you will not be able to sign in.
      </p>
      <p>You can choose to delete cookies at any time. You will then be signed out.</p>
      <Link className="text-primary text-xl" href="https://cowleyroadcondors.cc/contact-us/">
        Contact us
      </Link>
    </div>
  );
}
