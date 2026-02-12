"use client";

import { type FormEvent, useState } from "react";

import { addCoffee } from "@/data/coffees";
import {
  CoffeeInputSchema,
  CoffeeProcessSchema,
} from "@/domain/inventory/validation";

type CoffeeFormErrors = {
  name?: string;
  origin?: string;
  process?: string;
};

const processOptions = CoffeeProcessSchema.options;

export const CoffeeForm = () => {
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [process, setProcess] = useState(processOptions[0] ?? "Natural");
  const [errors, setErrors] = useState<CoffeeFormErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedOrigin = origin.trim();

    const result = CoffeeInputSchema.safeParse({
      name: trimmedName,
      origin: trimmedOrigin.length > 0 ? trimmedOrigin : undefined,
      process,
    });

    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        origin: fieldErrors.origin?.[0],
        process: fieldErrors.process?.[0],
      });
      return;
    }

    setErrors({});
    await addCoffee(result.data);
    setName("");
    setOrigin("");
    setProcess(processOptions[0] ?? "Natural");
  };

  return (
    <section className="rounded-[32px] border border-[#eadfce] bg-white/90 px-6 py-6 shadow-[0_18px_50px_-36px_rgba(44,34,24,0.6)]">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#8f7d6a]">
          New coffee
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#2c2218]">
          Add a coffee record
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
            Coffee name
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-12 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
            placeholder="e.g. La Esperanza"
          />
          {errors.name ? (
            <p className="text-sm text-[#b5542f]">{errors.name}</p>
          ) : null}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
            Origin (optional)
          </span>
          <input
            type="text"
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            className="h-12 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
            placeholder="e.g. Colombia"
          />
          {errors.origin ? (
            <p className="text-sm text-[#b5542f]">{errors.origin}</p>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#9a8774]">
            Process
          </span>
          <select
            value={process}
            onChange={(event) => setProcess(event.target.value)}
            className="h-12 rounded-2xl border border-[#e0d3c3] bg-white px-4 text-base text-[#2c2218] shadow-sm focus:border-[#2c2218] focus:outline-none"
          >
            {processOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.process ? (
            <p className="text-sm text-[#b5542f]">{errors.process}</p>
          ) : null}
        </label>

        <button
          type="submit"
          className="h-12 rounded-full bg-[#2c2218] text-sm font-semibold uppercase tracking-[0.18em] text-[#f7f2ea] transition hover:bg-[#20170f] md:col-span-2"
        >
          Add coffee
        </button>
      </form>
    </section>
  );
};
