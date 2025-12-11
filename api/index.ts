import { Card } from "../src/card.ts";
import { CONSTANTS, parseParams } from "../src/utils.ts";
import { COLORS, Theme } from "../src/theme.ts";
import { Error400 } from "../src/error_page.ts";
import "https://deno.land/x/dotenv@v0.5.0/load.ts";
import { staticRenderRegeneration } from "../src/StaticRenderRegeneration/index.ts";
import { GithubRepositoryService } from "../src/Repository/GithubRepository.ts";
import { GithubApiService } from "../src/Services/GithubApiService.ts";
import { ServiceError } from "../src/Types/index.ts";
import { ErrorPage } from "../src/pages/Error.ts";
import { cacheProvider } from "../src/config/cache.ts";

const serviceProvider = new GithubApiService();
const client = new GithubRepositoryService(serviceProvider).repository;

// Build cache control header with optimized caching strategy
const cacheControlHeader = [
  "public",
  `max-age=${CONSTANTS.CACHE_MAX_AGE}`,
  `s-maxage=${CONSTANTS.CDN_CACHE_MAX_AGE}`,
  `stale-while-revalidate=${CONSTANTS.STALE_WHILE_REVALIDATE}`,
].join(", ");

const defaultHeaders = new Headers({
  "Content-Type": "image/svg+xml",
  "Cache-Control": cacheControlHeader,
});

export default (request: Request) =>
  staticRenderRegeneration(
    request,
    {
      revalidate: CONSTANTS.REVALIDATE_TIME,
      headers: defaultHeaders,
    },
    function (req: Request) {
      return app(req);
    },
  );

async function app(req: Request): Promise<Response> {
  // Security: Limit query string length to prevent cache exhaustion
  const urlObj = new URL(req.url);
  if (urlObj.search.length > CONSTANTS.MAX_QUERY_LENGTH) {
    return new Response("Query string too long", {
      status: 400,
      headers: new Headers({
        "Content-Type": "text/plain",
        "Cache-Control": "no-store",
      }),
    });
  }

  const params = parseParams(req);
  const allowedUsername = Deno.env.get("ALLOWED_USERNAME")?.trim() || null;
  const requestedUsername = params.get("username");
  const normalizedRequestUsername = requestedUsername?.trim();
  const targetUsername = normalizedRequestUsername?.length
    ? normalizedRequestUsername
    : allowedUsername;

  // Security: Apply limits to prevent DoS attacks
  const rawRow = params.getNumberValue("row", CONSTANTS.DEFAULT_MAX_ROW);
  const rawColumn = params.getNumberValue(
    "column",
    CONSTANTS.DEFAULT_MAX_COLUMN,
  );
  const row = Math.min(Math.max(1, rawRow), CONSTANTS.MAX_ROW);
  const column = Math.min(Math.max(1, rawColumn), CONSTANTS.MAX_COLUMN);
  const themeParam: string = params.getStringValue("theme", "default");
  if (targetUsername === null) {
    const [base] = req.url.split("?");
    const error = new Error400(
      `<section>
      <div>
        <h2>"username" is a required query parameter</h2>
        <p>The URL should look like
        <div>
          <p id="base-show">${base}?username=USERNAME</p>
          <button>Copy Base Url</button>
          <span id="temporary-span"></span>
        </div>where
        <code>USERNAME</code> is <em>your GitHub username.</em>
      </div>
      <div>
        <h2>You can use this form: </h2>
        <p>Enter your username and click get trophies</p>
        <form action="https://github-profile-trophy.vercel.app/" method="get">
          <label for="username">GitHub Username</label>
          <input type="text" name="username" id="username" placeholder="Ex. gabriel-logan" required>
          <label for="theme">Theme (Optional)</label>
          <input type="text" name="theme" id="theme" placeholder="Ex. onedark" value="light">
          <text>
            See all the available themes
            <a href="https://github.com/ryo-ma/github-profile-trophy?tab=readme-ov-file#apply-theme" target="_blank">here</a>
          </text>
          <br>
          <button type="submit">Get Trophy&apos;s</button>
        </form>
      </div>
      <script>
        const base = "https://github-profile-trophy.vercel.app/";
        const button = document.querySelector("button");
        const input = document.querySelector("input");
        const temporarySpan = document.querySelector("#temporary-span");

        button.addEventListener("click", () => {
          navigator.clipboard.writeText(document.querySelector("#base-show").textContent);
          temporarySpan.textContent = "Copied!";
          setTimeout(() => {
            temporarySpan.textContent = "";
          }, 1500);
        });
      </script>
    </section>`,
    );
    return new Response(error.render(), {
      status: error.status,
      headers: new Headers({
        "Content-Type": "text/plain",
        "Cache-Control": cacheControlHeader,
      }),
    });
  }
  if (allowedUsername) {
    const normalizedAllowed = allowedUsername.toLowerCase();
    if (!targetUsername || targetUsername.toLowerCase() !== normalizedAllowed) {
      return new Response(
        `Forbidden: username is locked to ${allowedUsername}`,
        {
          status: 403,
          headers: new Headers({
            "Content-Type": "text/plain",
            "Cache-Control": "no-store",
          }),
        },
      );
    }
  }
  let theme: Theme = COLORS.default;
  if (Object.keys(COLORS).includes(themeParam)) {
    theme = COLORS[themeParam];
  }
  // Security: Apply limits to margin values to prevent DoS attacks
  const rawMarginWidth = params.getNumberValue(
    "margin-w",
    CONSTANTS.DEFAULT_MARGIN_W,
  );
  const rawPaddingHeight = params.getNumberValue(
    "margin-h",
    CONSTANTS.DEFAULT_MARGIN_H,
  );
  const marginWidth = Math.min(
    Math.max(0, rawMarginWidth),
    CONSTANTS.MAX_MARGIN,
  );
  const paddingHeight = Math.min(
    Math.max(0, rawPaddingHeight),
    CONSTANTS.MAX_MARGIN,
  );
  const noBackground = params.getBooleanValue(
    "no-bg",
    CONSTANTS.DEFAULT_NO_BACKGROUND,
  );
  const noFrame = params.getBooleanValue(
    "no-frame",
    CONSTANTS.DEFAULT_NO_FRAME,
  );
  const titles: Array<string> = params
    .getAll("title")
    .flatMap((r) => r.split(","))
    .map((r) => r.trim());
  const ranks: Array<string> = params
    .getAll("rank")
    .flatMap((r) => r.split(","))
    .map((r) => r.trim());

  const userKeyCache = ["v1", targetUsername].join("-");
  const userInfoCached = (await cacheProvider.get(userKeyCache)) || "{}";
  let userInfo;
  try {
    userInfo = JSON.parse(userInfoCached);
  } catch (error) {
    // Security: Clear corrupted cache to prevent repeated errors
    await cacheProvider.del(userKeyCache);
    userInfo = {};
  }
  const hasCache = !!Object.keys(userInfo).length;

  if (!hasCache) {
    const userResponseInfo = await client.requestUserInfo(targetUsername);
    if (userResponseInfo instanceof ServiceError) {
      return new Response(ErrorPage({ error: userResponseInfo }).render(), {
        status: userResponseInfo.code,
        headers: new Headers({
          "Content-Type": "text/plain",
          "Cache-Control": cacheControlHeader,
        }),
      });
    }
    userInfo = userResponseInfo;
    await cacheProvider.set(userKeyCache, JSON.stringify(userInfo));
  }
  // Success Response
  return new Response(
    new Card(
      titles,
      ranks,
      column,
      row,
      CONSTANTS.DEFAULT_PANEL_SIZE,
      marginWidth,
      paddingHeight,
      noBackground,
      noFrame,
    ).render(userInfo, theme),
    {
      headers: defaultHeaders,
    },
  );
}
