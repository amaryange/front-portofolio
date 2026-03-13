export function YouTube({ id }: { id: string }) {
  return (
    <div className="relative my-8 aspect-video w-full overflow-hidden rounded-lg border border-border">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
        title="YouTube video"
        loading="lazy"
      />
    </div>
  );
}
