import PageContainer from "@/components/pageContainer";
import TokenBurnForm from "@/components/tokenBurnForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Burn Supply | WokFlow",
  description: "Burn tokens and reclaim your rent!",
};


export default function TokenBurn() {
  return (
    <PageContainer title="Burn tokens" description="Burn tokens and reclaim your rent!">
      <TokenBurnForm />
    </PageContainer>
  );
}
