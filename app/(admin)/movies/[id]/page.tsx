export default function EditMoviePage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa phim</h1>
      {/* TODO: Implement movie edit form */}
      <p className="text-muted-foreground">Form chỉnh sửa phim ID: {params.id} - chưa triển khai</p>
    </div>
  );
}
