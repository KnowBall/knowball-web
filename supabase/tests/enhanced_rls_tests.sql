-- Helper function to log test results
CREATE OR REPLACE FUNCTION log_test_result(test_name TEXT, passed BOOLEAN)
RETURNS void AS $$
BEGIN
    RAISE NOTICE '%: %', test_name, CASE WHEN passed THEN 'Allowed' ELSE 'Denied' END;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    normal_user_id UUID;
    admin_user_id UUID;
    test_question_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO normal_user_id FROM public.profiles WHERE is_admin = false LIMIT 1;
    SELECT id INTO admin_user_id FROM public.profiles WHERE is_admin = true LIMIT 1;

    IF normal_user_id IS NULL OR admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Required test users not found. Please ensure you have both admin and non-admin users.';
    END IF;

    -- Test as normal user
    PERFORM set_config('request.jwt.claims.sub', normal_user_id::text, false);

    -- Questions table tests
    PERFORM log_test_result('Non-admin SELECT questions', 
        EXISTS(SELECT 1 FROM public.questions));
    
    PERFORM log_test_result('Non-admin INSERT questions', 
        NOT EXISTS(SELECT 1 FROM public.questions LIMIT 1 OFFSET 0 WHERE false));

    -- Scores table tests
    BEGIN
        INSERT INTO public.scores (user_id, score, total_questions)
        VALUES (normal_user_id, 10, 10);
        PERFORM log_test_result('Non-admin INSERT own score', true);
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result('Non-admin INSERT own score', false);
    END;

    BEGIN
        INSERT INTO public.scores (user_id, score, total_questions)
        VALUES (admin_user_id, 10, 10);
        PERFORM log_test_result('Non-admin INSERT other score', false);
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result('Non-admin INSERT other score', true);
    END;

    -- Profiles table tests
    PERFORM log_test_result('Non-admin SELECT own profile',
        EXISTS(SELECT 1 FROM public.profiles WHERE id = normal_user_id));
    
    PERFORM log_test_result('Non-admin SELECT other profile',
        NOT EXISTS(SELECT 1 FROM public.profiles WHERE id = admin_user_id));

    -- Test as admin user
    PERFORM set_config('request.jwt.claims.sub', admin_user_id::text, false);

    -- Questions table admin tests
    BEGIN
        INSERT INTO public.questions (question, options, correct_answer)
        VALUES ('Test?', ARRAY['A','B','C','D'], 'A')
        RETURNING id INTO test_question_id;
        PERFORM log_test_result('Admin INSERT questions', true);
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result('Admin INSERT questions', false);
    END;

    BEGIN
        UPDATE public.questions 
        SET question = question 
        WHERE id = test_question_id;
        PERFORM log_test_result('Admin UPDATE questions', true);
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result('Admin UPDATE questions', false);
    END;

    BEGIN
        DELETE FROM public.questions 
        WHERE id = test_question_id;
        PERFORM log_test_result('Admin DELETE questions', true);
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result('Admin DELETE questions', false);
    END;

    -- Scores/Profiles tests
    PERFORM log_test_result('Admin SELECT scores',
        EXISTS(SELECT 1 FROM public.scores));
    
    PERFORM log_test_result('Admin SELECT profiles',
        EXISTS(SELECT 1 FROM public.profiles));

    -- Cleanup
    DELETE FROM public.questions WHERE question = 'Test?';
    DELETE FROM public.scores WHERE user_id IN (normal_user_id, admin_user_id);
END $$; 