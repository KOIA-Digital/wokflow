import PageContainer from "@/components/pageContainer";
import RevokeMintForm from "@/components/revokeMintForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revoke Mint | WokFlow",
  description: "Revoke mint authority on your SPL-token!",
};

export default function RevokeMint() {
  return (
    <PageContainer title="Revoke mint" description="Revoke mint authority on your SPL-token!">
      <RevokeMintForm />
    </PageContainer>
  );
}
