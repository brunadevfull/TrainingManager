--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.videos DROP CONSTRAINT IF EXISTS videos_uploaded_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.videos DROP CONSTRAINT IF EXISTS videos_category_id_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.video_views DROP CONSTRAINT IF EXISTS video_views_video_id_videos_id_fk;
ALTER TABLE IF EXISTS ONLY public.video_views DROP CONSTRAINT IF EXISTS video_views_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.video_completions DROP CONSTRAINT IF EXISTS video_completions_video_id_videos_id_fk;
ALTER TABLE IF EXISTS ONLY public.video_completions DROP CONSTRAINT IF EXISTS video_completions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_category_id_categories_id_fk;
ALTER TABLE IF EXISTS ONLY public.document_views DROP CONSTRAINT IF EXISTS document_views_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.document_views DROP CONSTRAINT IF EXISTS document_views_document_id_documents_id_fk;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_created_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.videos DROP CONSTRAINT IF EXISTS videos_pkey;
ALTER TABLE IF EXISTS ONLY public.video_views DROP CONSTRAINT IF EXISTS video_views_pkey;
ALTER TABLE IF EXISTS ONLY public.video_completions DROP CONSTRAINT IF EXISTS video_completions_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_cpf_unique;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.document_views DROP CONSTRAINT IF EXISTS document_views_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS public.videos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.video_views ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.video_completions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.document_views ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcements ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.videos_id_seq;
DROP TABLE IF EXISTS public.videos;
DROP SEQUENCE IF EXISTS public.video_views_id_seq;
DROP TABLE IF EXISTS public.video_views;
DROP SEQUENCE IF EXISTS public.video_completions_id_seq;
DROP TABLE IF EXISTS public.video_completions;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.documents_id_seq;
DROP TABLE IF EXISTS public.documents;
DROP SEQUENCE IF EXISTS public.document_views_id_seq;
DROP TABLE IF EXISTS public.document_views;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.announcements_id_seq;
DROP TABLE IF EXISTS public.announcements;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone,
    active boolean DEFAULT true NOT NULL,
    target_role text
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: document_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_views (
    id integer NOT NULL,
    user_id integer NOT NULL,
    document_id integer NOT NULL,
    viewed_at timestamp without time zone DEFAULT now() NOT NULL,
    downloaded boolean DEFAULT false NOT NULL
);


--
-- Name: document_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.document_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.document_views_id_seq OWNED BY public.document_views.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    filename text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    category_id integer,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL,
    download_count integer DEFAULT 0 NOT NULL
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    nip character varying(14) NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    rank text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_login timestamp without time zone,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: video_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_completions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    video_id integer NOT NULL,
    completed_at timestamp without time zone DEFAULT now() NOT NULL,
    progress integer DEFAULT 100 NOT NULL,
    certificate_issued boolean DEFAULT false NOT NULL
);


--
-- Name: video_completions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.video_completions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: video_completions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.video_completions_id_seq OWNED BY public.video_completions.id;


--
-- Name: video_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.video_views (
    id integer NOT NULL,
    user_id integer NOT NULL,
    video_id integer NOT NULL,
    viewed_at timestamp without time zone DEFAULT now() NOT NULL,
    duration integer NOT NULL
);


--
-- Name: video_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.video_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: video_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.video_views_id_seq OWNED BY public.video_views.id;


--
-- Name: videos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.videos (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    filename text NOT NULL,
    duration integer NOT NULL,
    category_id integer,
    requires_certificate boolean DEFAULT false NOT NULL,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL
);


--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: document_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_views ALTER COLUMN id SET DEFAULT nextval('public.document_views_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: video_completions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_completions ALTER COLUMN id SET DEFAULT nextval('public.video_completions_id_seq'::regclass);


--
-- Name: video_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views ALTER COLUMN id SET DEFAULT nextval('public.video_views_id_seq'::regclass);


--
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, content, type, priority, created_by, created_at, expires_at, active, target_role) FROM stdin;
1	Treinamento Obrigatório - Segurança Naval	Todos os militares devem completar o treinamento de segurança naval até o final do mês. O treinamento inclui:\\n\\n- Procedimentos de emergência\\n- Uso de equipamentos de segurança\\n- Protocolos de comunicação\\n\\nPara mais informações, consulte o manual de operações.	warning	2	1	2025-07-11 00:03:04.250613	\N	t	user
2	Manutenção do Sistema	O sistema passará por manutenção programada no próximo sábado das 02:00 às 06:00.\\n\\nDurante este período, o acesso pode estar limitado.	info	1	1	2025-07-11 00:03:04.250613	\N	t	\N
3	Atualização de Protocolos	Novos protocolos de segurança foram implementados. Todos os administradores devem revisar as mudanças.	urgent	3	1	2025-07-11 00:03:04.250613	\N	t	admin
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, description, created_at) FROM stdin;
1	Treinamento Básico	Vídeos de treinamento militar básico	2025-07-10 23:52:28.858134
2	Segurança Naval	Procedimentos de segurança na Marinha	2025-07-10 23:52:28.858134
3	Operações Especiais	Treinamento para operações especiais	2025-07-10 23:52:28.858134
\.


--
-- Data for Name: document_views; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_views (id, user_id, document_id, viewed_at, downloaded) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, title, description, filename, file_type, file_size, category_id, uploaded_by, created_at, active, download_count) FROM stdin;
1	Manual de Operações Navais	Documento completo sobre operações navais da Marinha	manual_operacoes_navais.pdf	pdf	2048000	1	1	2025-07-11 00:02:58.611561	t	0
2	Regulamento de Segurança	Normas e procedimentos de segurança para militares	regulamento_seguranca.pdf	pdf	1024000	2	1	2025-07-11 00:02:58.611561	t	0
3	Protocolo de Emergência	Procedimentos para situações de emergência	protocolo_emergencia.pdf	pdf	512000	2	1	2025-07-11 00:02:58.611561	t	0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, nip, password, role, rank, created_at, last_login, active) FROM stdin;
1	Administrador Sistema	12.3456.78	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	admin	Capitão	2025-07-10 23:52:21.168132	\N	t
2	Militar Teste	98.7654.32	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	Sargento	2025-07-10 23:52:21.168132	\N	t
3	BRUNA	12.3456.79	$2b$10$jleitPtxigS92LrcVHXwUemd/kIfRtqDaCp/AHOMggcrWmZNFsL5u	user	1T	2025-07-15 13:26:02.126959	\N	t
\.


--
-- Data for Name: video_completions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.video_completions (id, user_id, video_id, completed_at, progress, certificate_issued) FROM stdin;
\.


--
-- Data for Name: video_views; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.video_views (id, user_id, video_id, viewed_at, duration) FROM stdin;
\.


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.videos (id, title, description, filename, duration, category_id, requires_certificate, uploaded_by, created_at, active) FROM stdin;
1	Vídeo de Exemplo - Treinamento Básico	Vídeo demonstrativo do sistema de treinamento militar	exemplo.mp4	300	1	t	1	2025-07-10 23:52:37.752592	t
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 3, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 3, true);


--
-- Name: document_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.document_views_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documents_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: video_completions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.video_completions_id_seq', 1, false);


--
-- Name: video_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.video_views_id_seq', 1, false);


--
-- Name: videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.videos_id_seq', 1, true);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: document_views document_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_views
    ADD CONSTRAINT document_views_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: users users_cpf_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_cpf_unique UNIQUE (nip);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_completions video_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_completions
    ADD CONSTRAINT video_completions_pkey PRIMARY KEY (id);


--
-- Name: video_views video_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_pkey PRIMARY KEY (id);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: document_views document_views_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_views
    ADD CONSTRAINT document_views_document_id_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_views document_views_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_views
    ADD CONSTRAINT document_views_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: documents documents_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: documents documents_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: video_completions video_completions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_completions
    ADD CONSTRAINT video_completions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: video_completions video_completions_video_id_videos_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_completions
    ADD CONSTRAINT video_completions_video_id_videos_id_fk FOREIGN KEY (video_id) REFERENCES public.videos(id);


--
-- Name: video_views video_views_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: video_views video_views_video_id_videos_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.video_views
    ADD CONSTRAINT video_views_video_id_videos_id_fk FOREIGN KEY (video_id) REFERENCES public.videos(id);


--
-- Name: videos videos_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: videos videos_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

