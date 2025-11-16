
import MessageRightSide from "../../_components/MessageRightSide";

export default function MenMessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" h-[calc(100vh-60px)] flex py-6 px-4 bg-gray-50 gap-6">
      <main className="w-[72%]">{children}</main>
      <MessageRightSide />
    </div>
  );
}
