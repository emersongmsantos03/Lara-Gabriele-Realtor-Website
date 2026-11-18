"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import DragHandle from "@tiptap/extension-drag-handle-react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Youtube from "@tiptap/extension-youtube";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table, TableRow } from "@tiptap/extension-table";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { NodeSelection } from "@tiptap/pm/state";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronRight,
  Eye,
  GripVertical,
  History,
  ImagePlus,
  Keyboard,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  MoreHorizontal,
  Plus,
  Settings2,
  Smartphone,
  Trash2,
  Undo,
  X,
} from "lucide-react";
import { liveStatus, slugify, type Post, type Revision } from "@/lib/admin/post-types";
import { formatPacific } from "@/lib/admin/time";
import { STATUS_STYLE } from "../PostsList";
import { confirmDialog } from "../DialogHost";
import Toolbar, { isMac } from "./Toolbar";
import { CalloutBubble, LinkBubble, MediaBubble, TableBubble, TextBubble } from "./Bubbles";
import { BlogImage, BlogTableCell, BlogTableHeader, Callout, CtaButton, MapEmbed, SlashCommand, type ButtonAttrs, type SlashState } from "./extensions";
import { BlockMenu, filterBlocks, type Block, type BlockCtx } from "./blocks";
import { ButtonDialog, LinkDialog, type LinkTarget } from "./dialogs";
import { HistoryDialog, ShortcutsDialog, TemplatePicker } from "./extra";
import { pickImage, uploadImage } from "./media";
import PublishDialog from "./PublishDialog";
import SettingsPanel, { type Form } from "./SettingsPanel";
import { Modal, PromptDialog, useDismiss, type PromptConfig } from "./ui";

type SaveState = "idle" | "saving" | "saved" | "error";

const toForm = (p: Post | null): Form => ({
  title: p?.title ?? "",
  excerpt: p?.excerptAuto ? "" : (p?.excerpt ?? ""),
  slug: p?.slug ?? "",
  coverImage: p?.coverImage ?? "",
  coverAlt: p?.coverAlt ?? "",
  contentHtml: p?.contentHtml ?? "",
  sites: p?.sites ?? ["pacific"],
  tags: p?.tags ?? [],
  featured: p?.featured ?? false,
  seoTitle: p?.seoTitle ?? "",
  seoDescription: p?.seoDescription ?? "",
});

export default function PostEditor({ initial, linkTargets, allTags }: { initial: Post | null; linkTargets: LinkTarget[]; allTags: string[] }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(initial);
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [slugTouched, setSlugTouched] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>(initial ? "saved" : "idle");
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(toForm(initial)));
  const [toast, setToast] = useState<{ msg: string; bad?: boolean } | null>(null);
  const [prompt, setPrompt] = useState<PromptConfig | null>(null);
  const [linkDlg, setLinkDlg] = useState<null | { href: string; newTab: boolean; needsText: boolean }>(null);
  const [buttonDlg, setButtonDlg] = useState<null | { initial: Partial<ButtonAttrs>; editing: boolean }>(null);
  const [publishing, setPublishing] = useState<null | "publish" | "reschedule">(null);
  const [preview, setPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!initial);
  const [showHistory, setShowHistory] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [menu, setMenu] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [coverDrag, setCoverDrag] = useState(false);
  const [slash, setSlash] = useState<SlashState>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const [conflict, setConflict] = useState(false);
  const menuRef = useDismiss(menu, useCallback(() => setMenu(false), []));
  const editorRef = useRef<Editor | null>(null);
  const savingRef = useRef<Promise<Post | null> | null>(null);
  const postRef = useRef(post);
  const hoverRef = useRef<{ pos: number; size: number } | null>(null);
  const slashRef = useRef({ state: null as SlashState, items: [] as Block[], index: 0 });
  const ctxRef = useRef<BlockCtx | null>(null);
  const keyRef = useRef<(e: KeyboardEvent) => boolean>(() => false);
  const dblRef = useRef<(type: string) => void>(() => {});

  useEffect(() => {
    postRef.current = post;
  }, [post]);

  const status = post ? liveStatus(post) : "draft";
  const isLive = status === "published";
  const dirty = JSON.stringify(form) !== savedSnapshot;

  const flash = useCallback((msg: string, bad = false) => {
    setToast({ msg, bad });
    setTimeout(() => setToast((t) => (t?.msg === msg ? null : t)), bad ? 6000 : 3000);
  }, []);

  // ---------- Images ----------
  const insertImages = useCallback(
    async (files: File[], pos?: number) => {
      const editor = editorRef.current;
      if (!editor) return;
      for (const file of files.filter((f) => f.type.startsWith("image/"))) {
        setUploading((n) => n + 1);
        try {
          const src = await uploadImage(file);
          const node = { type: "image", attrs: { src, alt: "" } };
          if (pos !== undefined) editor.chain().focus().insertContentAt(pos, node).run();
          else editor.chain().focus().insertContent(node).run();
        } catch (e) {
          flash((e as Error).message, true);
        } finally {
          setUploading((n) => n - 1);
        }
      }
    },
    [flash],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https", HTMLAttributes: { target: null, rel: null } },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      BlogImage,
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
      CtaButton,
      Callout,
      MapEmbed,
      Table.configure({ resizable: false, renderWrapper: true }),
      TableRow,
      BlogTableHeader,
      BlogTableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Placeholder.configure({
        includeChildren: true,
        placeholder: ({ node, editor: e }) =>
          node.type.name === "heading"
            ? "Heading"
            : e.isEmpty
              ? "Start writing here… Type / to add a photo, button, colored box, table, map and more."
              : "Type / for blocks",
        showOnlyCurrent: true,
      }),
      // The callbacks below run later, on key presses in the editor, never during render.
      // eslint-disable-next-line react-hooks/refs
      SlashCommand.configure({
        onState: (s) => {
          slashRef.current.state = s;
          setSlash(s);
          setSlashIndex(0);
        },
        onKey: (e) => keyRef.current(e),
      }),
    ],
    content: initial?.contentHtml ?? "",
    editorProps: {
      attributes: { class: "post-body", spellcheck: "true", "aria-label": "Post content" },
      handleDrop: (view, event, _slice, moved) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (moved || !files.some((f) => f.type.startsWith("image/"))) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        insertImages(files, pos);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (!files.some((f) => f.type.startsWith("image/"))) return false;
        event.preventDefault();
        insertImages(files);
        return true;
      },
      handleDoubleClickOn: (_view, _pos, node) => {
        if (node.type.name === "ctaButton" || node.type.name === "mapEmbed") {
          dblRef.current(node.type.name);
          return true;
        }
        return false;
      },
      // Links and buttons inside the editor never navigate away.
      handleDOMEvents: {
        click: (_view, e) => {
          if ((e.target as HTMLElement).closest("a")) e.preventDefault();
          return false;
        },
      },
    },
    onUpdate: ({ editor: e }) => setForm((f) => ({ ...f, contentHtml: e.isEmpty ? "" : e.getHTML() })),
  });
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const words =
    useEditorState({
      editor,
      selector: ({ editor: e }) => (e ? (e.storage.characterCount.words() as number) : 0),
    }) ?? 0;

  // ---------- Saving ----------
  const effectiveSlug = form.slug && (slugTouched || isLive || status === "scheduled") ? form.slug : slugify(form.title || "untitled");

  const save = useCallback(
    async (opts: { status?: Post["status"]; publishAt?: string | null; quiet?: boolean; checkpoint?: boolean } = {}): Promise<Post | null> => {
      if (savingRef.current) await savingRef.current.catch(() => null);
      const current = postRef.current;
      const body = {
        ...form,
        slug: effectiveSlug,
        status: opts.status ?? current?.status ?? "draft",
        checkpoint: opts.checkpoint ?? !opts.quiet,
        // Lets the server notice if someone else saved this post in the meantime.
        ...(current ? { expectedUpdatedAt: current.updatedAt } : {}),
        ...(opts.publishAt !== undefined ? { publishAt: opts.publishAt } : {}),
      };
      const snapshot = JSON.stringify(form);
      setSaveState("saving");
      const run = (async () => {
        const res = await fetch(current ? `/api/admin/posts/${current.id}` : "/api/admin/posts", {
          method: current ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) throw new Error("You were logged out. Open the login page in a new tab, sign in, then come back and save again.");
        if (res.status === 409) setConflict(true);
        if (!res.ok) throw new Error(data.error || "Couldn't save. Check your internet and try again.");
        return data.post as Post;
      })();
      savingRef.current = run;
      try {
        const saved = await run;
        if (!current) window.history.replaceState(null, "", `/admin/posts/${saved.id}`);
        setPost(saved);
        postRef.current = saved;
        // Once a post is live its address is fixed, so show the one the server chose.
        const keepSlug = saved.status !== "draft";
        setSavedSnapshot(keepSlug ? JSON.stringify({ ...form, slug: saved.slug }) : snapshot);
        if (keepSlug) setForm((f) => (f.slug === saved.slug ? f : { ...f, slug: saved.slug }));
        setSaveState("saved");
        return saved;
      } catch (e) {
        setSaveState("error");
        if (!opts.quiet) flash((e as Error).message, true);
        return null;
      } finally {
        savingRef.current = null;
      }
    },
    [form, effectiveSlug, flash],
  );

  // Drafts save themselves a couple of seconds after you stop typing.
  useEffect(() => {
    if (status !== "draft" || !dirty || conflict) return;
    if (!form.title.trim() && !form.contentHtml && !form.coverImage) return;
    const t = setTimeout(() => save({ status: "draft", quiet: true }), 2000);
    return () => clearTimeout(t);
  }, [form, status, dirty, save, conflict]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // ---------- Dialog openers ----------
  const openLink = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes("link");
    setLinkDlg({ href: (attrs.href as string) || "", newTab: attrs.target === "_blank", needsText: editor.state.selection.empty && !editor.isActive("link") });
  }, [editor]);

  const openVideo = useCallback(
    () =>
      setPrompt({
        title: "Add a YouTube video",
        label: "YouTube link",
        placeholder: "https://www.youtube.com/watch?v=…",
        help: "Open the video on YouTube, click Share → Copy, and paste the link here.",
        submit: "Add video",
        onSubmit: (v) => {
          const ok = editorRef.current?.chain().focus().setYoutubeVideo({ src: v }).run();
          if (!ok) flash("That doesn't look like a YouTube link.", true);
        },
      }),
    [flash],
  );

  const openMap = useCallback((edit = false) => {
    const e = editorRef.current;
    if (!e) return;
    const current = edit ? ((e.getAttributes("mapEmbed").address as string) || "") : "";
    setPrompt({
      title: edit ? "Change the map address" : "Add a map",
      label: "Address or place",
      placeholder: "e.g. 1234 Santa Fe Hills Dr, San Marcos, CA",
      help: "Shows a Google map that readers can move and zoom.",
      initial: current,
      submit: edit ? "Save" : "Add map",
      onSubmit: (address) => {
        if (!address) return;
        if (edit) e.chain().focus().updateAttributes("mapEmbed", { address }).run();
        else e.chain().focus().insertContent({ type: "mapEmbed", attrs: { address } }).run();
      },
    });
  }, []);

  const openButton = useCallback((preset?: Partial<ButtonAttrs>, edit = false) => {
    const e = editorRef.current;
    if (!e) return;
    if (edit) {
      const sel = e.state.selection;
      if (sel instanceof NodeSelection && sel.node.type.name === "ctaButton") {
        setButtonDlg({ initial: sel.node.attrs as ButtonAttrs, editing: true });
      }
      return;
    }
    setButtonDlg({ initial: preset ?? {}, editing: false });
  }, []);

  const pickPhoto = useCallback(async () => {
    const f = await pickImage();
    if (f) insertImages([f]);
  }, [insertImages]);

  useEffect(() => {
    ctxRef.current = { pickPhoto, openVideo, openMap: () => openMap(false), openButton: (p) => openButton(p) };
    dblRef.current = (type) => (type === "ctaButton" ? openButton(undefined, true) : openMap(true));
  }, [pickPhoto, openVideo, openMap, openButton]);

  const runBlock = useCallback((b: Block) => {
    if (editorRef.current && ctxRef.current) b.run(editorRef.current, ctxRef.current);
  }, []);

  // "/" menu keyboard handling.
  const slashItems = slash ? filterBlocks(slash.query) : [];
  useEffect(() => {
    slashRef.current.items = slashItems;
    slashRef.current.index = slashIndex;
  });
  const pickSlash = useCallback((b: Block) => {
    const st = slashRef.current.state;
    if (!st) return;
    st.command({
      id: b.id,
      run: (e, range) => {
        e.chain().focus().deleteRange(range).run();
        if (ctxRef.current) b.run(e, ctxRef.current);
      },
    });
  }, []);
  useEffect(() => {
    keyRef.current = (e) => {
      const { state, items, index } = slashRef.current;
      if (!state || !items.length) return false;
      if (e.key === "ArrowDown") {
        setSlashIndex((index + 1) % items.length);
        return true;
      }
      if (e.key === "ArrowUp") {
        setSlashIndex((index - 1 + items.length) % items.length);
        return true;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        pickSlash(items[index]);
        return true;
      }
      return false;
    };
  }, [pickSlash]);

  const addBelowHovered = () => {
    const e = editorRef.current;
    const h = hoverRef.current;
    if (!e || !h) return;
    const at = h.pos + h.size;
    e.chain().insertContentAt(at, { type: "paragraph", content: [{ type: "text", text: "/" }] }).setTextSelection(at + 2).focus().run();
  };

  const replaceImage = async () => {
    const file = await pickImage();
    if (!file || !editor) return;
    setUploading((n) => n + 1);
    try {
      const src = await uploadImage(file);
      editor.chain().focus().updateAttributes("image", { src }).run();
    } catch (e) {
      flash((e as Error).message, true);
    } finally {
      setUploading((n) => n - 1);
    }
  };

  const imagePrompt = (attr: "alt" | "caption") => {
    if (!editor) return;
    setPrompt(
      attr === "alt"
        ? {
            title: "Describe this photo",
            label: "What's in the photo?",
            placeholder: "e.g. Backyard pool with hillside views at sunset",
            help: "Google reads this, and so do screen readers for people who can't see the image.",
            initial: (editor.getAttributes("image").alt as string) || "",
            submit: "Save",
            onSubmit: (v) => editor.chain().focus().updateAttributes("image", { alt: v }).run(),
          }
        : {
            title: "Photo caption",
            label: "Caption (shown under the photo)",
            placeholder: "e.g. The view from the back patio",
            initial: (editor.getAttributes("image").caption as string) || "",
            submit: "Save",
            onSubmit: (v) => editor.chain().focus().updateAttributes("image", { caption: v }).run(),
          },
    );
  };

  const setCover = async (file: File | null) => {
    if (!file) return;
    setUploading((n) => n + 1);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, coverImage: url }));
    } catch (e) {
      flash((e as Error).message, true);
    } finally {
      setUploading((n) => n - 1);
    }
  };

  // ---------- Actions ----------
  const problems = [...(form.title.trim() ? [] : ["Add a title."]), ...(form.contentHtml ? [] : ["Write something in the post."])];
  const publish = (when: string | null) => save({ status: when ? "scheduled" : "published", publishAt: when, checkpoint: true });

  async function update() {
    if (!form.sites.length) return flash("Pick at least one website in Settings.", true);
    const saved = await save({ checkpoint: true });
    if (saved) flash(isLive ? "Changes are live." : "Changes saved.");
  }
  const saveDraft = () => save({ status: "draft", checkpoint: true }).then((p) => p && flash("Draft saved."));

  async function backToDraft() {
    setMenu(false);
    const ok = await confirmDialog(
      isLive
        ? {
            title: "Unpublish this post?",
            message: "It will be removed from your websites right away and kept here as a draft. You can publish it again anytime.",
            confirmLabel: "Unpublish",
            tone: "danger",
            icon: "undo",
          }
        : {
            title: "Cancel the schedule?",
            message: "The post won't go live. It will be kept as a draft.",
            confirmLabel: "Cancel schedule",
            cancelLabel: "Keep schedule",
            tone: "danger",
            icon: "undo",
          },
    );
    if (!ok) return;
    const saved = await save({ status: "draft", publishAt: null, checkpoint: true });
    if (saved) flash(isLive ? "Unpublished. It's a draft again." : "Schedule cancelled.");
  }

  async function remove() {
    setMenu(false);
    if (!post) return router.push("/admin/posts");
    const ok = await confirmDialog({
      title: "Move this post to the trash?",
      message: (
        <>
          <p>
            <b className="text-[var(--a-text)]">“{form.title || "Untitled"}”</b>
            {isLive ? " will disappear from your websites right away." : " will be moved to the trash."}
          </p>
          <p>You can restore it from the Trash for 30 days.</p>
        </>
      ),
      confirmLabel: "Move to trash",
      tone: "danger",
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      setSavedSnapshot(JSON.stringify(form));
      router.push("/admin/posts");
      router.refresh();
    } else flash("Couldn't delete. Please try again.", true);
  }

  function restore(r: Revision) {
    editor?.commands.setContent(r.contentHtml || "", { emitUpdate: true });
    setForm((f) => ({ ...f, title: r.title, excerpt: r.excerpt, coverImage: r.coverImage, contentHtml: r.contentHtml }));
    setShowHistory(false);
    flash(status === "draft" ? "Version restored." : "Version restored. Click Update to put it live.");
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const modKey = isMac ? e.metaKey : e.ctrlKey;
    if (modKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openLink();
    }
    if (modKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      if (status === "draft") saveDraft();
      else update();
    }
  };

  const saveLabel =
    uploading > 0
      ? "Uploading photo…"
      : saveState === "saving"
        ? "Saving…"
        : saveState === "error"
          ? "Not saved"
          : dirty
            ? status === "draft"
              ? "Editing…"
              : "Unsaved changes"
            : saveState === "saved"
              ? status === "draft"
                ? "Draft saved"
                : "All changes saved"
              : "";

  const slugValue = slugTouched || isLive || status === "scheduled" ? form.slug : effectiveSlug;
  const settingsOpen = !focusMode;

  return (
    <div className="flex-1 flex flex-col bg-white" onKeyDown={onKeyDown}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[var(--a-line)]">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 h-[60px]">
          <Link href="/admin/posts" className="tb-btn gap-1.5 font-medium" aria-label="Back to posts">
            <ArrowLeft size={18} />
            <span className="hidden md:inline">Posts</span>
          </Link>
          <span className={`hidden sm:inline rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[status].cls}`}>{STATUS_STYLE[status].label}</span>
          <span className={`text-sm truncate flex items-center gap-1.5 ${saveState === "error" ? "text-[var(--a-bad)]" : "text-[var(--a-faint)]"}`} aria-live="polite">
            {(saveState === "saving" || uploading > 0) && <Loader2 size={14} className="animate-spin" />}
            {saveState === "saved" && !dirty && uploading === 0 && <Check size={14} />}
            {saveLabel}
          </span>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button className="tb-btn hidden lg:inline-flex" onClick={() => setFocusMode((f) => !f)} title={focusMode ? "Show settings" : "Focus mode (hide settings)"}>
              {focusMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
            <button className="a-btn a-btn-ghost px-3" onClick={() => setPreview(true)} title="See how it will look">
              <Eye size={16} />
              <span className="hidden md:inline">Preview</span>
            </button>
            <button className="a-btn a-btn-ghost px-3 xl:hidden" onClick={() => setShowSettings(true)} aria-label="Post settings">
              <Settings2 size={16} />
              <span className="hidden md:inline">Settings</span>
            </button>
            {status === "draft" ? (
              <>
                <button className="a-btn a-btn-ghost hidden sm:inline-flex" disabled={saveState === "saving"} onClick={saveDraft}>
                  Save draft
                </button>
                <button className="a-btn a-btn-accent" onClick={() => setPublishing("publish")}>
                  Publish…
                </button>
              </>
            ) : (
              <button className="a-btn a-btn-accent" disabled={saveState === "saving" || (!dirty && saveState !== "error")} onClick={update}>
                {isLive ? "Update" : "Save changes"}
              </button>
            )}
            <div className="relative" ref={menuRef}>
              <button className="tb-btn" aria-label="More options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
                <MoreHorizontal size={18} />
              </button>
              {menu && (
                <div className="pop right-0 top-11 w-64">
                  {status === "draft" && (
                    <button className="pop-item sm:hidden" onClick={() => { setMenu(false); saveDraft(); }}>
                      <Check size={16} /> Save draft
                    </button>
                  )}
                  {status === "scheduled" && (
                    <>
                      <button className="pop-item" onClick={() => { setMenu(false); setPublishing("reschedule"); }}>
                        <CalendarClock size={16} /> Change date &amp; time
                      </button>
                      <button className="pop-item" onClick={() => { setMenu(false); setPublishing("publish"); }}>
                        <ChevronRight size={16} /> Publish now instead
                      </button>
                    </>
                  )}
                  {post && (
                    <button className="pop-item" onClick={() => { setMenu(false); setShowHistory(true); }}>
                      <History size={16} /> Version history
                    </button>
                  )}
                  <button className="pop-item" onClick={() => { setMenu(false); setShowTemplates(true); }}>
                    <Plus size={16} /> Start from a template
                  </button>
                  <button className="pop-item" onClick={() => { setMenu(false); setShowKeys(true); }}>
                    <Keyboard size={16} /> Tips &amp; shortcuts
                  </button>
                  {status !== "draft" && (
                    <button className="pop-item" onClick={backToDraft}>
                      <Undo size={16} /> {isLive ? "Unpublish (back to draft)" : "Cancel schedule"}
                    </button>
                  )}
                  <button className="pop-item text-[var(--a-bad)]" onClick={remove}>
                    <Trash2 size={16} /> Move to trash
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {conflict && (
          <div className="bg-[#fdf0ee] text-[#8a2d22] text-sm px-5 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <b>Someone else saved this post while you were editing.</b>
            <span>To avoid overwriting their work, saving is paused. Copy anything you want to keep, then</span>
            <button className="font-semibold underline" onClick={() => window.location.reload()}>reload their version</button>
          </div>
        )}
        {status === "scheduled" && post?.publishAt && (
          <div className="bg-[#eef4fd] text-[#1f4f8f] text-sm px-5 py-2 flex items-center gap-2">
            <CalendarClock size={15} /> Goes live {formatPacific(post.publishAt)} (San Diego time)
          </div>
        )}
      </header>
      {editor && (
        // Sticky on larger screens; on phones it wraps and scrolls away so the writing area keeps the room.
        <div className="sm:sticky sm:top-[60px] z-20 border-b border-[var(--a-line)] bg-white">
          <div className="mx-auto max-w-[1320px]">
            <Toolbar editor={editor} onLink={openLink} onImage={pickPhoto} onVideo={openVideo} onInsert={runBlock} />
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Writing area */}
        <div className="flex-1 min-w-0">
          <div className="mx-auto max-w-[760px] px-5 sm:px-12 py-8 sm:py-12">
            {form.coverImage ? (
              <div className="group relative rounded-2xl overflow-hidden mb-8 bg-[var(--a-hover)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.coverImage} alt={form.coverAlt} className="w-full aspect-[16/9] object-cover" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button className="a-btn a-btn-ghost h-9 shadow" onClick={async () => setCover(await pickImage())}>
                    <ImagePlus size={15} /> Change
                  </button>
                  <button className="a-btn a-btn-ghost h-9 px-2.5 shadow" aria-label="Remove cover photo" onClick={() => setForm((f) => ({ ...f, coverImage: "", coverAlt: "" }))}>
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={async () => setCover(await pickImage())}
                onDragOver={(e) => {
                  e.preventDefault();
                  setCoverDrag(true);
                }}
                onDragLeave={() => setCoverDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setCoverDrag(false);
                  setCover(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`w-full mb-8 rounded-2xl border-2 border-dashed py-8 flex flex-col items-center gap-1.5 transition-colors ${
                  coverDrag ? "border-[#2a78d6] bg-[#f1f7fe]" : "border-[var(--a-line)] hover:border-[#b9c3cc] hover:bg-[var(--a-bg)]"
                }`}
              >
                <ImagePlus size={24} className="text-[var(--a-faint)]" />
                <span className="font-medium">Add a cover photo</span>
                <span className="text-sm text-[var(--a-faint)]">Click, or drag a photo here. Shown at the top and on blog cards.</span>
              </button>
            )}

            {form.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <span key={t} className="text-xs tracking-[0.14em] uppercase text-[var(--gold)] font-semibold">{t}</span>
                ))}
              </div>
            )}
            <TitleInput value={form.title} onChange={(title) => setForm((f) => ({ ...f, title }))} onEnter={() => editor?.commands.focus("start")} />

            <div className="editor-canvas mt-6 relative">
              {editor ? <EditorContent editor={editor} /> : <div className="h-[420px]" />}
              {editor && (
                <DragHandle
                  editor={editor}
                  onNodeChange={({ node, pos }) => {
                    hoverRef.current = node ? { pos, size: node.nodeSize } : null;
                  }}
                >
                  <div className="drag-handle">
                    <button type="button" className="dh-btn" title="Add a block below" onClick={addBelowHovered}>
                      <Plus size={16} />
                    </button>
                    <span className="dh-btn cursor-grab" title="Drag to move this block">
                      <GripVertical size={16} />
                    </span>
                  </div>
                </DragHandle>
              )}
              {editor && <TextBubble editor={editor} onLink={openLink} />}
              {editor && <LinkBubble editor={editor} onEdit={openLink} />}
              {editor && <CalloutBubble editor={editor} />}
              {editor && <TableBubble editor={editor} />}
              {editor && (
                <MediaBubble
                  editor={editor}
                  onReplace={replaceImage}
                  onAlt={() => imagePrompt("alt")}
                  onCaption={() => imagePrompt("caption")}
                  onEditButton={() => openButton(undefined, true)}
                  onEditMap={() => openMap(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <aside
          className={`${showSettings ? "fixed inset-0 z-50 flex justify-end bg-[rgba(14,25,35,0.35)]" : "hidden"} ${
            settingsOpen ? "xl:static xl:z-auto xl:flex xl:bg-transparent xl:w-[340px] xl:shrink-0 xl:border-l xl:border-[var(--a-line)]" : ""
          }`}
          onMouseDown={(e) => e.target === e.currentTarget && setShowSettings(false)}
        >
          <div className="w-[92vw] max-w-[360px] xl:w-full xl:max-w-none h-full overflow-y-auto bg-white xl:sticky xl:top-[110px] xl:h-[calc(100vh-110px)]">
            <SettingsPanel
              form={form}
              setForm={setForm}
              post={post}
              isLive={isLive}
              slugValue={slugValue}
              onSlugChange={(v) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: v.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }));
              }}
              onSlugBlur={() => {
                if (!form.slug.replace(/-/g, "")) {
                  setSlugTouched(false);
                  if (post && status !== "draft") return setForm((f) => ({ ...f, slug: post.slug }));
                }
                setForm((f) => ({ ...f, slug: f.slug.replace(/-/g, "") ? slugify(f.slug) : "" }));
              }}
              effectiveSlug={effectiveSlug}
              allTags={allTags}
              words={words}
              plainText={editor?.getText() ?? ""}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </aside>
      </div>

      {/* "/" menu */}
      {slash && slash.rect && (
        <div
          className="pop fixed w-[300px]"
          style={{
            left: Math.min(slash.rect.left, (typeof window !== "undefined" ? window.innerWidth : 1200) - 312),
            top: slash.rect.bottom + 8 + 320 > (typeof window !== "undefined" ? window.innerHeight : 900) ? Math.max(8, slash.rect.top - 330) : slash.rect.bottom + 8,
          }}
        >
          <BlockMenu items={slashItems} active={slashIndex} onHover={setSlashIndex} onPick={pickSlash} compact />
        </div>
      )}

      {publishing && (
        <PublishDialog
          post={post}
          sites={form.sites}
          setSites={(sites) => setForm((f) => ({ ...f, sites }))}
          problems={problems}
          scheduleOnly={publishing === "reschedule"}
          onPublish={publish}
          onClose={() => setPublishing(null)}
        />
      )}
      {prompt && <PromptDialog cfg={prompt} onClose={() => setPrompt(null)} />}
      {linkDlg && editor && (
        <LinkDialog
          initial={linkDlg}
          needsText={linkDlg.needsText}
          posts={linkTargets}
          onClose={() => setLinkDlg(null)}
          onSave={({ href, newTab, text }) => {
            const target = newTab ? "_blank" : null;
            const c = editor.chain().focus();
            if (linkDlg.needsText) c.insertContent({ type: "text", text: text || href.replace(/^(mailto:|tel:)/, ""), marks: [{ type: "link", attrs: { href, target } }] }).run();
            else c.extendMarkRange("link").setLink({ href, target }).run();
          }}
          onRemove={linkDlg.href ? () => editor.chain().focus().extendMarkRange("link").unsetLink().run() : undefined}
        />
      )}
      {buttonDlg && editor && (
        <ButtonDialog
          initial={buttonDlg.initial}
          posts={linkTargets}
          onClose={() => setButtonDlg(null)}
          onSave={(attrs) => {
            if (buttonDlg.editing) editor.chain().focus().updateAttributes("ctaButton", attrs).run();
            else editor.chain().focus().insertContent({ type: "ctaButton", attrs }).run();
          }}
        />
      )}
      {showTemplates && (
        <TemplatePicker
          onClose={() => setShowTemplates(false)}
          onPick={async (t) => {
            setShowTemplates(false);
            if (t.id === "blank") return;
            const hasContent = !!form.contentHtml || !!form.title;
            if (
              hasContent &&
              !(await confirmDialog({
                title: "Replace what you've written?",
                message: `The “${t.label}” template will replace the current title and text. You can undo it with Undo (${isMac ? "⌘" : "Ctrl"}+Z) or from Version history.`,
                confirmLabel: "Use template",
                tone: "warning",
                icon: "warning",
              }))
            )
              return;
            editor?.commands.setContent(t.html, { emitUpdate: true });
            setForm((f) => ({ ...f, title: t.title, tags: t.tags.length ? t.tags : f.tags }));
          }}
        />
      )}
      {showHistory && post && <HistoryDialog postId={post.id} onRestore={restore} onClose={() => setShowHistory(false)} />}
      {showKeys && <ShortcutsDialog onClose={() => setShowKeys(false)} />}
      {preview && <Preview form={form} onClose={() => setPreview(false)} />}

      {toast && (
        <div
          role="status"
          className={`a-toast fixed bottom-5 left-1/2 -translate-x-1/2 z-[120] max-w-[92vw] rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${
            toast.bad ? "bg-[#b4372a] text-white" : "bg-[#15212c] text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function TitleInput({ value, onChange, onEnter }: { value: string; onChange: (v: string) => void; onEnter: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter();
        }
      }}
      placeholder="Post title"
      aria-label="Post title"
      maxLength={200}
      className="w-full resize-none overflow-hidden bg-transparent outline-none font-display text-[34px] sm:text-[44px] leading-[1.12] text-[var(--ink)] placeholder:text-[#c2cad1]"
    />
  );
}

function Preview({ form, onClose }: { form: Form; onClose: () => void }) {
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  return (
    <Modal title="Preview" onClose={onClose} wide>
      <div className="flex gap-1 mb-4">
        {(
          [
            ["desktop", "Computer", Monitor],
            ["phone", "Phone", Smartphone],
          ] as const
        ).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setDevice(id)} className={`a-btn h-9 ${device === id ? "a-btn-primary" : "a-btn-ghost"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-[var(--a-line)] bg-[var(--cream)] overflow-auto max-h-[70vh]">
        <div className={`mx-auto bg-[var(--cream)] ${device === "phone" ? "w-[375px] max-w-full" : "w-full"}`}>
          <div className="bg-[var(--ink)] text-[var(--cream)] px-6 py-8">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--gold-light)]">{form.tags[0] || "Blog"}</p>
            <h1 className={`font-display mt-2 leading-tight ${device === "phone" ? "text-2xl" : "text-3xl"}`}>{form.title || "Untitled"}</h1>
            <p className="mt-2 text-xs opacity-60">By Lara Gabriele · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          {form.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.coverImage} alt="" className="w-full aspect-[16/9] object-cover" />
          )}
          <div className={`post-body px-6 py-8 ${device === "phone" ? "text-base" : ""}`} dangerouslySetInnerHTML={{ __html: form.contentHtml || "<p><em>Nothing written yet.</em></p>" }} />
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--a-muted)]">This is how the post reads on Pacific Friendly Realty. Santa Fe Hills and Lomas Verdes use their own fonts and colors.</p>
    </Modal>
  );
}
