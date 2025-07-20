import { useState } from "react";

export default function Addurl() {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    tags: [""],
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  const addTagField = () => {
    if (formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, ""] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Send formData to backend via fetch/axios
    console.log("Submitting:", formData);
  };

  return (
    <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-8 text-white">
      <h2 className="text-xl font-semibold mb-6">Add a New Link</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Link title"
          required
          className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-neutral-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <input
          type="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="https://example.com"
          required
          className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-neutral-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Tags (max 5)</label>
          {formData.tags.map((tag, index) => (
            <input
              key={index}
              type="text"
              value={tag}
              onChange={(e) => handleTagChange(index, e.target.value)}
              placeholder={`Tag ${index + 1}`}
              className="w-full px-4 py-2 rounded-lg bg-neutral-900 text-white border border-neutral-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          ))}
          {formData.tags.length < 5 && (
            <button
              type="button"
              onClick={addTagField}
              className="text-sm text-amber-400 hover:underline mt-1"
            >
              + Add Tag
            </button>
          )}
        </div>

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes (optional)"
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-neutral-900 text-white border border-neutral-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
        />

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-amber-500 text-black rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-amber-600 transition"
        >
          Save Link
        </button>
      </form>
    </div>
  );
}
