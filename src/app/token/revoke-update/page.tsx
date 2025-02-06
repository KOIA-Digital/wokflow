import PageContainer from "@/components/pageContainer";
import RevokeUpdateForm from "@/components/revokeUpdateForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revoke Update | WokFlow",
  description: "Revoke update on your SPL-token!",
};

export default function RevokeUpdate() {
  return (
    <PageContainer title="Revoke update" description="Revoke update on your SPL-token!">
      <RevokeUpdateForm />
    </PageContainer>
  );
}
