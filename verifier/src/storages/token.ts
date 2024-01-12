import fs from "node:fs";

const SUBJECTID_ACI_MAPS_PATH = new URL("./subjectid-aci.map.json", import.meta.url);

type SetToken = {
  subjectId: string;
  aci: string;
}

type Maps = {
  subjectIdToAci: Record<string, string>;
  aciToSubjectId: Record<string, string>;
}

export class TokenStorage {

  private readonly maps: Maps;

  constructor() {
    if (!fs.existsSync(SUBJECTID_ACI_MAPS_PATH)) {
      this.maps = {
        subjectIdToAci: {},
        aciToSubjectId: {}
      };
      fs.writeFileSync(
        SUBJECTID_ACI_MAPS_PATH,
        JSON.stringify(this.maps, null, 2),
        { flag: "w" });
    } else {
      const content = fs.readFileSync(SUBJECTID_ACI_MAPS_PATH, { encoding: "utf8" });
      this.maps = JSON.parse(content) as Maps;
    }
  }

  async setToken({ subjectId, aci }: SetToken): Promise<string | null> {
    const isTokenSet = this.maps.aciToSubjectId[aci];
    if (isTokenSet) return null;
    this.maps.aciToSubjectId[aci] = subjectId;
    this.maps.subjectIdToAci[subjectId] = aci;
    fs.writeFileSync(
      SUBJECTID_ACI_MAPS_PATH,
      JSON.stringify(this.maps, null, 2),
      { flag: "w" });
    return aci;
  }

  async findToken(subjectId: string): Promise<string | undefined> {
    return this.maps.subjectIdToAci[subjectId];
  }

  // for tests
  async deleteAll(): Promise<void> {
    for (const subjectId of Object.keys(this.maps.subjectIdToAci)) {
      delete this.maps.subjectIdToAci[subjectId];
    }
    for (const aci of Object.keys(this.maps.aciToSubjectId)) {
      delete this.maps.aciToSubjectId[aci];
    }
    fs.unlinkSync(SUBJECTID_ACI_MAPS_PATH);
  }
}