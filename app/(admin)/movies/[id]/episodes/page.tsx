export default function EpisodesPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý tập phim</h1>
      {/* TODO: Danh sách tập phim của series, thêm/sửa/xóa tập */}
      <p className="text-muted-foreground">Danh sách tập phim ID: {params.id} - chưa triển khai</p>
    </div>
  );
}
