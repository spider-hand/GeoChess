\restrict dbmate

-- Dumped from database version 18.4 (709c4c3)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_game_moves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_game_moves (
    id text NOT NULL,
    game_id text NOT NULL,
    move_index integer NOT NULL,
    country text NOT NULL,
    actor text NOT NULL,
    user_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_game_moves_actor_check CHECK ((actor = ANY (ARRAY['start'::text, 'player'::text, 'ai'::text])))
);


--
-- Name: ai_games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_games (
    id text NOT NULL,
    user_id text NOT NULL,
    difficulty text NOT NULL,
    result text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_games_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text]))),
    CONSTRAINT ai_games_result_check CHECK (((result IS NULL) OR (result = ANY (ARRAY['win'::text, 'lose'::text, 'cancelled'::text]))))
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id text NOT NULL,
    display_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    country text,
    ai_easy_total_win integer DEFAULT 0 NOT NULL,
    ai_easy_total_lose integer DEFAULT 0 NOT NULL,
    ai_medium_total_win integer DEFAULT 0 NOT NULL,
    ai_medium_total_lose integer DEFAULT 0 NOT NULL,
    ai_hard_total_win integer DEFAULT 0 NOT NULL,
    ai_hard_total_lose integer DEFAULT 0 NOT NULL,
    CONSTRAINT users_display_name_check CHECK ((btrim(display_name) <> ''::text))
);


--
-- Name: with_friends_game_moves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.with_friends_game_moves (
    id text NOT NULL,
    game_id text NOT NULL,
    move_index integer NOT NULL,
    country text NOT NULL,
    actor text NOT NULL,
    user_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT with_friends_game_moves_actor_check CHECK ((actor = ANY (ARRAY['start'::text, 'player1'::text, 'player2'::text])))
);


--
-- Name: with_friends_games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.with_friends_games (
    id text NOT NULL,
    room_key text NOT NULL,
    player1_user_id text NOT NULL,
    player2_user_id text,
    result text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT with_friends_games_result_check CHECK (((result IS NULL) OR (result = ANY (ARRAY['player1_win'::text, 'player2_win'::text, 'cancelled'::text]))))
);


--
-- Name: ai_game_moves ai_game_moves_game_id_move_index_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_game_moves
    ADD CONSTRAINT ai_game_moves_game_id_move_index_key UNIQUE (game_id, move_index);


--
-- Name: ai_game_moves ai_game_moves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_game_moves
    ADD CONSTRAINT ai_game_moves_pkey PRIMARY KEY (id);


--
-- Name: ai_games ai_games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_games
    ADD CONSTRAINT ai_games_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: with_friends_game_moves with_friends_game_moves_game_id_move_index_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.with_friends_game_moves
    ADD CONSTRAINT with_friends_game_moves_game_id_move_index_key UNIQUE (game_id, move_index);


--
-- Name: with_friends_game_moves with_friends_game_moves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.with_friends_game_moves
    ADD CONSTRAINT with_friends_game_moves_pkey PRIMARY KEY (id);


--
-- Name: with_friends_games with_friends_games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.with_friends_games
    ADD CONSTRAINT with_friends_games_pkey PRIMARY KEY (id);


--
-- Name: with_friends_games with_friends_games_room_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.with_friends_games
    ADD CONSTRAINT with_friends_games_room_key_key UNIQUE (room_key);


--
-- Name: ai_game_moves ai_game_moves_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_game_moves
    ADD CONSTRAINT ai_game_moves_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.ai_games(id) ON DELETE CASCADE;


--
-- Name: ai_game_moves ai_game_moves_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_game_moves
    ADD CONSTRAINT ai_game_moves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: ai_games ai_games_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_games
    ADD CONSTRAINT ai_games_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: with_friends_game_moves with_friends_game_moves_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.with_friends_game_moves
    ADD CONSTRAINT with_friends_game_moves_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.with_friends_games(id) ON DELETE CASCADE;


--
-- Name: with_friends_game_moves with_friends_game_moves_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.with_friends_game_moves
    ADD CONSTRAINT with_friends_game_moves_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: with_friends_games with_friends_games_player1_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.with_friends_games
    ADD CONSTRAINT with_friends_games_player1_user_id_fkey FOREIGN KEY (player1_user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: with_friends_games with_friends_games_player2_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.with_friends_games
    ADD CONSTRAINT with_friends_games_player2_user_id_fkey FOREIGN KEY (player2_user_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260628013427'),
    ('20260629000000'),
    ('20260712000000'),
    ('20260713000000'),
    ('20260713000001'),
    ('20260713000002');
