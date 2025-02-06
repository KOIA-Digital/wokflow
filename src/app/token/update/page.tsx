import PageContainer from "@/components/pageContainer";
import TokenUpdateForm from "@/components/tokenUpdateForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Token | WokFlow",
  description: "Update metadata of your token with few clicks!",
};

export default function TokenUpdate() {
  return (
    <PageContainer title="Update token" description="Update metadata of your token with few clicks!">
    <TokenUpdateForm/>
  </PageContainer>
  );
}
