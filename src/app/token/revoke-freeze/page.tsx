import PageContainer from "@/components/pageContainer";
import RevokeFreezeForm from "@/components/revokeFreezeForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revoke Freeze | WokFlow",
  description: "Revoke freeze authority on your SPL-token!",
};

export default function RevokeFreeze() {
  return (
    <PageContainer title="Revoke freeze" description="Revoke freeze authority on your SPL-token!">
      <RevokeFreezeForm />
    </PageContainer>
  );
}
