import PageContainer from "@/components/pageContainer";
import TokenAirdropForm from "@/components/tokenAirdropForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Token | WokFlow",
  description: "Update metadata of your token with few clicks!",
};

export default function AirdropToken() {
  return (
    <PageContainer title="Airdrop tokens" description="Update metadata of your token with few clicks!">
      <TokenAirdropForm />
    </PageContainer>
  );
}
