<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Shopmate architecture
- Keep the guided prototype at `/` with an opening state and six explicitly named screen states; this preserves shared local demo context without extra top-level screens.
- Keep business calculations and the recent weekly dataset in the browser-safe Shopmate model module; pure functions give all screens one tested source of truth.
- Keep prototype state in React only, including chats, mission, mentor selection and demo scheduling; this prototype intentionally does not use backend services or persistence.
- Reference supplied media through original-filename asset pointers, and use simple styled fallbacks until remaining assets arrive; uploaded imagery must not be recreated or renamed.
