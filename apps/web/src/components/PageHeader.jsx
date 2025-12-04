export function PageHeader({ titulo }) {
  return (
    <div className="bg-white border-bottom py-3 mb-4">
      <div className="container">
        <h2 className="m-0 fw-bold" style={{ fontSize: "1.8rem" }}>
          {titulo}
        </h2>
      </div>
    </div>
  );
}
