import SignatureClient from "./SignatureClient";

type SignaturePageProps = {
  params: Promise<{ id: string }>;
};

export default async function SignaturePage({ params }: SignaturePageProps) {
  const { id } = await params;
  return <SignatureClient universeId={id} />;
}
