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

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, nip, password, role, rank, created_at, last_login, active) FROM stdin;
1	Administrador Sistema	12.3456.78	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	admin	Capitão	2025-07-10 23:52:21.168132	\N	t
2	Militar Teste	98.7654.32	$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi	user	Sargento	2025-07-10 23:52:21.168132	\N	t
3	BRUNA	12.3456.79	$2b$10$jleitPtxigS92LrcVHXwUemd/kIfRtqDaCp/AHOMggcrWmZNFsL5u	user	1T	2025-07-15 13:26:02.126959	\N	t
\.


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
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, title, description, filename, file_type, file_size, category_id, uploaded_by, created_at, active, download_count) FROM stdin;
1	Manual de Operações Navais	Documento completo sobre operações navais da Marinha	manual_operacoes_navais.pdf	pdf	2048000	1	1	2025-07-11 00:02:58.611561	t	0
2	Regulamento de Segurança	Normas e procedimentos de segurança para militares	regulamento_seguranca.pdf	pdf	1024000	2	1	2025-07-11 00:02:58.611561	t	0
3	Protocolo de Emergência	Procedimentos para situações de emergência	protocolo_emergencia.pdf	pdf	512000	2	1	2025-07-11 00:02:58.611561	t	0
\.


--
-- Data for Name: document_views; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_views (id, user_id, document_id, viewed_at, downloaded) FROM stdin;
\.


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.videos (id, title, description, filename, duration, category_id, requires_certificate, uploaded_by, created_at, active) FROM stdin;
1	Vídeo de Exemplo - Treinamento Básico	Vídeo demonstrativo do sistema de treinamento militar	exemplo.mp4	300	1	t	1	2025-07-10 23:52:37.752592	t
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
-- PostgreSQL database dump complete
--

