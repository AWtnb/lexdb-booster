/**
 * Github上のコミットにタグが付与されたことをトリガーとしてGithub Actionsでリリースを作成する。
 * そのためのコミットタグ作成スクリプト。
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

type Part = "major" | "minor" | "patch";

/** 現在のブランチ名を取得する */
const getCurrentBranch = (): string => {
  return execSync("git rev-parse --abbrev-ref HEAD", {
    encoding: "utf-8",
  }).trim();
};

/** 未コミットの変更（未追跡ファイルを含む）があるか判定する */
const hasUncommittedChanges = (): boolean => {
  const result = execSync("git status --porcelain", { encoding: "utf-8" });
  return 0 < result.trim().length;
};

/** main ブランチかつ作業ツリーがクリーンであることを検証する。満たさなければ終了する */
const assertReleasable = (): void => {
  const branch = getCurrentBranch();
  if (branch !== "main") {
    console.error(`must be on main branch (current: ${branch})`);
    process.exit(1);
  }

  if (hasUncommittedChanges()) {
    console.error("working tree has uncommitted changes");
    process.exit(1);
  }
};

/** 最新タグを取得する。なければ v0.0.0 を返す */
const getLatestTag = (): string => {
  const result = execSync("git tag --sort=-v:refname", { encoding: "utf-8" });
  const tags = result.trim().split("\n").filter(Boolean);
  return tags[0] ?? "v0.0.0";
};

/** バージョンをインクリメントする */
const bump = (tag: string, part: Part): string => {
  const [major = 0, minor = 0, patch = 0] = tag
    .replace(/^v/, "")
    .split(".")
    .map(Number);

  if (part === "major") return `v${major + 1}.0.0`;
  if (part === "minor") return `v${major}.${minor + 1}.0`;
  if (part === "patch") return `v${major}.${minor}.${patch + 1}`;

  console.error(`unknown part: ${part}`);
  process.exit(1);
};

/** package.json の version フィールドを更新する */
const updatePackageJson = (newVersion: string): void => {
  const path = "package.json";
  const pkg = JSON.parse(readFileSync(path, "utf-8"));
  pkg.version = newVersion.replace(/^v/, "");
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
};

const main = (): void => {
  const part = (process.argv[2] as Part) ?? "patch";
  const latest = getLatestTag();
  const newTag = bump(latest, part);

  console.log(`${latest} -> ${newTag}`);

  // package.json を書き換える前に検証する
  assertReleasable();

  updatePackageJson(newTag);

  // 新バージョンが反映された状態でビルドする
  execSync("pnpm build", { stdio: "inherit" });

  execSync("git add package.json");
  execSync(`git commit -m "chore: bump version to ${newTag}"`);
  execSync(`git tag ${newTag}`);
  execSync("git push origin HEAD");
  execSync(`git push origin ${newTag}`);
};

main();
