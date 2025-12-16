export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Chi tiết người dùng</h1>
      {/* TODO: Implement user detail, edit */}
      <p className="text-muted-foreground">Chi tiết người dùng ID: {params.id} - chưa triển khai</p>
    </div>
  );
}
