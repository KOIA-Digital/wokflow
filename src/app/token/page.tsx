import PageContainer from "@/components/pageContainer";
import TokenCreateForm from "@/components/tokenCreateForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Token | WokFlow",
    description: "Start your cooking process by creating your own SPL-token!",
  };

export default function Token() {
    
    return (
        <PageContainer title="Create token" description="Start your cooking process by creating your own SPL-token!">
            <TokenCreateForm/>
        </PageContainer>
    );
}
