import ImageKit from "imagekit";

// Initialize ImageKit instance
export const imagekit = new ImageKit({
  publicKey:
    process.env.IMAGEKIT_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
    "public_tSMaUnQgppIX50gYO/ZSxBiJAFY=",
  privateKey:
    process.env.IMAGEKIT_PRIVATE_KEY ||
    "private_LQzzQKv8MlTdLtIxrEJwVL0/pwc=",
  urlEndpoint:
    process.env.IMAGEKIT_URL_ENDPOINT ||
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
    "https://ik.imagekit.io/d1tywic6tn",
});

/**
 * Generates authentication parameters (token, expire, signature)
 * for direct secure browser-to-ImageKit video uploads.
 */
export function getImageKitAuth() {
  return imagekit.getAuthenticationParameters();
}
