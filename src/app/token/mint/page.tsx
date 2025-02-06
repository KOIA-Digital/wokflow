import PageContainer from "@/components/pageContainer";
import TokenMintForm from "@/components/tokenMintForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mint Supply | WokFlow",
  description: "Mint more supply for your SPL-token!",
};

export default function TokenMint() {
  return (
    <PageContainer title="Mint tokens" description="Mint more supply for your SPL-token!">
      <TokenMintForm />
    </PageContainer>
  );
}
