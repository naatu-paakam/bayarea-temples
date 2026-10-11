import { Link } from 'react-router-dom';
import { REVIEW_DISCLAIMER } from '../data/temples';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">About this project</h1>
      <div className="space-y-4 text-[17px] leading-relaxed">
        <p>
          <strong>Bay Area Temples</strong> is a devotee-built directory of Hindu temples across the San Francisco Bay
          Area — from Livermore’s Shiva-Vishnu Temple to San Francisco’s Vedanta Society. It was put together during
          Navarathri 2026 as a practical visiting guide.
        </p>
        <h2 className="text-xl font-bold pt-2">How temples are ranked</h2>
        <p>{REVIEW_DISCLAIMER} Ratings are out of 5. The count is a rough proxy for how established a temple is — not a
        verdict on spiritual merit.</p>
        <h2 className="text-xl font-bold pt-2">Data sources</h2>
        <p>
          Temple details, hours and festival programs are compiled from public Google listings and the temples’ own
          websites, observed in October 2026. Timings change — please confirm with the temple before visiting.
        </p>
        <h2 className="text-xl font-bold pt-2">Suggest an edit</h2>
        <p>
          Spotted something wrong or missing? Use the Suggest Edits form below — it goes straight to the maintainers.
        </p>
        <form
          name="suggest-edit"
          method="POST"
          data-netlify="true"
          className="bg-white border border-[#f0e2cc] rounded-xl p-5 space-y-3"
        >
          <input type="hidden" name="form-name" value="suggest-edit" />
          <label className="block">
            <span className="text-sm text-muted">Temple</span>
            <input name="temple" required className="mt-1 w-full rounded-lg border border-[#e8d5b5] px-3 py-2.5" />
          </label>
          <label className="block">
            <span className="text-sm text-muted">What should change?</span>
            <textarea
              name="suggestion"
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-[#e8d5b5] px-3 py-2.5"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted">Your email (optional)</span>
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded-lg border border-[#e8d5b5] px-3 py-2.5"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-maroon text-white px-6 py-2.5 font-semibold min-h-[44px]"
          >
            Send suggestion
          </button>
        </form>
        <p>
          <Link to="/temples" className="text-maroon font-semibold underline">
            ← Back to all temples
          </Link>
        </p>
      </div>
    </div>
  );
}
