
import React from 'react';
import { Helmet } from 'react-helmet-async';

type MetaHelmetProps = {
  title?: string;
  description?: string;
  path?: string;
  imageUrl?: string;
};

const MetaHelmet: React.FC<MetaHelmetProps> = ({
  title = "Islamic AI Sermons",
  description = "Discover a new way to connect with Islamic teachings through AI-generated sermons that inspire, educate, and uplift your spiritual journey.",
  path = "",
  imageUrl = "/og-image.png",
}) => {
  const baseUrl = "https://islamicaudio.techrealm.online";
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  const canonicalUrl = `${baseUrl}${path}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default MetaHelmet;
