import { Helmet } from "react-helmet-async";
import { appConfig } from "@/config/app";

interface HeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function Head({
  title,
  description = "React + Vite + TypeScript template for building apps with shadcn/ui",
  keywords = "react, vite, typescript, shadcn, ui, template",
  ogImage = "/og-image.jpg",
  noIndex = false,
}: HeadProps) {
  const pageTitle = title ? `${title} | ${appConfig.name}` : appConfig.name;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Social Media */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Search Engine */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
}
