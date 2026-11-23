// src/services/pwaCharactersApi.ts
export interface PwaCharacter {
  id: string;
  initials: string;
  nombre: string;
  rol: string;
  salud: string;
  actitud: string;
  apariciones: string[];
  acciones: string[];
  habilidades: string[];
  descripcion: string;
}

const PWA_API_CHARACTERS_URL = 'https://vaporlock-pwa.onrender.com/api/personajes';

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[,|;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function makeInitials(name: string, idx: number): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return `P${idx + 1}`;
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts.map((p) => p[0]).join('').slice(0, 3).toUpperCase();
}

export async function fetchCharactersFromPwaApi(
  signal?: AbortSignal
): Promise<PwaCharacter[]> {
  const response = await fetch(PWA_API_CHARACTERS_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`API PWA respondió con estado ${response.status}`);
  }

  const payload = await response.json();
  const rawList: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.personajes)
      ? payload.personajes
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return rawList
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object')
    .map((item, idx) => {
      const nombre = String(
        item.nombre ?? item.Nombre ?? item.name ?? `Personaje ${idx + 1}`
      ).trim();

      const saludRaw = item.salud ?? item.Salud ?? item.vida ?? item.hp;
      const actitudRaw = item.actitud ?? item.Actitud ?? item.ia ?? item.comportamiento;

      return {
        id: String(item.id ?? item.pkPersonaje ?? item._id ?? `${nombre}-${idx}`),
        initials: makeInitials(nombre, idx),
        nombre,
        rol: String(item.rol ?? item.Rol ?? item.role ?? 'Personaje').trim(),
        salud:
          saludRaw === undefined || saludRaw === null || String(saludRaw).trim() === ''
            ? '—'
            : String(saludRaw).trim(),
        actitud:
          actitudRaw === undefined || actitudRaw === null || String(actitudRaw).trim() === ''
            ? '—'
            : String(actitudRaw).trim(),
        apariciones: toStringArray(item.apariciones ?? item.Apariciones),
        acciones: toStringArray(item.acciones ?? item.Acciones),
        habilidades: toStringArray(item.habilidades ?? item.Habilidades),
        descripcion: String(
          item.descripcion ?? item.Descripcion ?? 'Sin descripción registrada en la API.'
        ).trim(),
      };
    });
}