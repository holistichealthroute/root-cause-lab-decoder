import React, { useEffect, useState } from "react";
import { get, post, request } from "../../api/HttpService";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 5;

const Suppliments: React.FC = () => {
  const [supplements, setSupplements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    productLink: "",
    dosage: "",
    description: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    setLoading(true);
    try {
      const res = await get<any[]>("/supplements/active");
      setSupplements(res);
      setCurrentPage(1);
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(supplements.length / ITEMS_PER_PAGE);
  const paginatedSupplements = supplements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddClick = () => {
    setEditId(null);
    setForm({ name: "", productLink: "", dosage: "", description: "" });
    setShowForm(true);
  };

  const handleEditClick = (supp: any) => {
    setEditId(supp.id);
    setForm({
      name: supp.name || "",
      productLink: supp.productLink || "",
      dosage: supp.dosage || "",
      description: supp.description || "",
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", productLink: "", dosage: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await request(`/supplements/update/${editId}`, {
          method: "PUT",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
        });
        toast.success("Supplement updated successfully");
      } else {
        await post("/supplements/add_supplement", form);
        toast.success("Supplement added successfully");
      }
      handleCancel();
      fetchSupplements();
    } catch (err) {
      toast.error("Error adding supplement");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await request(`/supplements/delete/${id}`, { method: "DELETE" });
      fetchSupplements();
      toast.success("Supplement deleted successfully!");
    } catch (err) {
      toast.error("Error deleting supplement!");
    }
  };

  return (
    <div className="grid gap-16" style={{ margin: "32px" }}>
      <section className="card text-center" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 className="card-title text-align-center" style={{ margin: 0 }}>
            Supplements
          </h2>
          {!showForm && (
            <button
              className="btn btn-primary"
              style={{
                minWidth: 100,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
              }}
              onClick={handleAddClick}
            >
              <Plus size={18} />
              Add
            </button>
          )}
        </div>
        {showForm ? (
          <form
            className="card-form"
            onSubmit={handleSubmit}
            style={{
              margin: "2rem auto",
              maxWidth: "100%",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <label
              htmlFor="name"
              style={{
                fontWeight: 500,
                marginBottom: 4,
                display: "block",
              }}
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              required
              style={{
                marginBottom: "1rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            <label
              htmlFor="productLink"
              style={{
                fontWeight: 500,
                marginBottom: 4,
                display: "block",
              }}
            >
              Product Link
            </label>
            <input
              id="productLink"
              name="productLink"
              value={form.productLink}
              onChange={handleChange}
              placeholder="Product Link"
              style={{
                marginBottom: "1rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            <label
              htmlFor="dosage"
              style={{
                fontWeight: 500,
                marginBottom: 4,
                display: "block",
              }}
            >
              Dosage
            </label>
            <input
              id="dosage"
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="Dosage"
              style={{
                marginBottom: "1rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            <label
              htmlFor="description"
              style={{
                fontWeight: 500,
                marginBottom: 4,
                display: "block",
              }}
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              rows={6}
              style={{
                marginBottom: "1rem",
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                minHeight: "6rem",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "1rem",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn btn-primary"
                type="submit"
                style={{ minWidth: "8rem" }}
              >
                {editId ? "Update" : "Add"}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                style={{ minWidth: "8rem" }}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <table
              className="card-table"
              style={{
                width: "100%",
                margin: "2rem auto 0 auto",
                borderCollapse: "separate",
                borderSpacing: "0 8px",
                border: "1px solid #e0e0e0",
                borderRadius: "0.5rem",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                background: "#fff",
              }}
            >
              <thead>
                <tr style={{ background: "#f5f7fa" }}>
                  <th
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Product Link
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Dosage
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "0.75rem",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ padding: "1rem", textAlign: "center" }}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : paginatedSupplements.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ padding: "1rem", textAlign: "center" }}
                    >
                      No supplements found.
                    </td>
                  </tr>
                ) : (
                  paginatedSupplements.map((supp: any, idx: number) => (
                    <tr
                      key={supp.id}
                      style={{
                        background: idx % 2 === 0 ? "#fafbfc" : "#fff",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <td style={{ padding: "0.75rem" }}>{supp.name}</td>
                      <td style={{ padding: "0.75rem" }}>
                        {supp.productLink ? (
                          <a
                            href={supp.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {supp.productLink}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={{ padding: "0.75rem" }}>{supp.dosage}</td>
                      <td style={{ padding: "0.75rem" }}>{supp.description}</td>
                      <td style={{ textAlign: "center", padding: "0.75rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              padding: 0,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Edit"
                            onClick={() => handleEditClick(supp)}
                          >
                            <Pencil size={20} />
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              padding: 0,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Delete"
                            onClick={() => handleDelete(supp.id)}
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                  margin: "1.5rem 0",
                }}
              >
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Suppliments;
