-- Test helper function to log results
CREATE OR REPLACE FUNCTION log_test_result(test_name TEXT, expected TEXT, actual TEXT, passed BOOLEAN)
RETURNS void AS $$
BEGIN
    RAISE NOTICE 'Test: % | Expected: % | Actual: % | Passed: %',
        test_name, expected, actual, passed;
END;
$$ LANGUAGE plpgsql;

-- Test as Non-Admin User
DO $$
DECLARE
    normal_user_id UUID;
    other_user_id UUID;
    test_question_id UUID;
    test_score_id UUID;
BEGIN
    -- Get a normal user's ID (replace with actual user ID)
    SELECT id INTO normal_user_id FROM auth.users LIMIT 1;
    -- Get another user's ID for testing
    SELECT id INTO other_user_id FROM auth.users WHERE id != normal_user_id LIMIT 1;

    -- Set session context to normal user
    PERFORM set_config('request.jwt.claim.sub', normal_user_id::text, true);

    -- Test questions table
    BEGIN
        -- SELECT should succeed
        PERFORM COUNT(*) FROM public.questions;
        PERFORM log_test_result(
            'Non-Admin SELECT questions',
            'Allowed',
            'Allowed',
            true
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result(
            'Non-Admin SELECT questions',
            'Allowed',
            'Denied',
            false
        );
    END;

    BEGIN
        -- INSERT should fail
        INSERT INTO public.questions (question, options, correct_answer)
        VALUES ('Test question', ARRAY['A', 'B', 'C', 'D'], 'A');
        PERFORM log_test_result(
            'Non-Admin INSERT questions',
            'Denied',
            'Allowed',
            false
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result(
            'Non-Admin INSERT questions',
            'Denied',
            'Denied',
            true
        );
    END;

    -- Test scores table
    BEGIN
        -- INSERT own score should succeed
        INSERT INTO public.scores (user_id, score, total_questions)
        VALUES (normal_user_id, 5, 10);
        PERFORM log_test_result(
            'Non-Admin INSERT own score',
            'Allowed',
            'Allowed',
            true
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result(
            'Non-Admin INSERT own score',
            'Allowed',
            'Denied',
            false
        );
    END;

    BEGIN
        -- INSERT other's score should fail
        INSERT INTO public.scores (user_id, score, total_questions)
        VALUES (other_user_id, 5, 10);
        PERFORM log_test_result(
            'Non-Admin INSERT other score',
            'Denied',
            'Allowed',
            false
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result(
            'Non-Admin INSERT other score',
            'Denied',
            'Denied',
            true
        );
    END;

    -- Test profiles table
    BEGIN
        -- SELECT own profile should succeed
        PERFORM COUNT(*) FROM public.profiles WHERE id = normal_user_id;
        PERFORM log_test_result(
            'Non-Admin SELECT own profile',
            'Allowed',
            'Allowed',
            true
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result(
            'Non-Admin SELECT own profile',
            'Allowed',
            'Denied',
            false
        );
    END;

    BEGIN
        -- SELECT other's profile should fail
        PERFORM COUNT(*) FROM public.profiles WHERE id = other_user_id;
        PERFORM log_test_result(
            'Non-Admin SELECT other profile',
            'Denied',
            'Allowed',
            false
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result(
            'Non-Admin SELECT other profile',
            'Denied',
            'Denied',
            true
        );
    END;
END $$;

-- Test as Admin User
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get an admin user's ID (replace with actual admin user ID)
    SELECT id INTO admin_user_id 
    FROM public.profiles 
    WHERE is_admin = true 
    LIMIT 1;

    -- Set session context to admin user
    PERFORM set_config('request.jwt.claim.sub', admin_user_id::text, true);

    -- Test questions table
    BEGIN
        -- All operations should succeed
        INSERT INTO public.questions (question, options, correct_answer)
        VALUES ('Admin test question', ARRAY['A', 'B', 'C', 'D'], 'A')
        RETURNING id INTO test_question_id;

        UPDATE public.questions 
        SET question = 'Updated question'
        WHERE id = test_question_id;

        DELETE FROM public.questions 
        WHERE id = test_question_id;

        PERFORM log_test_result(
            'Admin ALL operations questions',
            'Allowed',
            'Allowed',
            true
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result(
            'Admin ALL operations questions',
            'Allowed',
            'Denied',
            false
        );
    END;

    -- Test scores table
    BEGIN
        -- SELECT should succeed
        PERFORM COUNT(*) FROM public.scores;
        PERFORM log_test_result(
            'Admin SELECT scores',
            'Allowed',
            'Allowed',
            true
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result(
            'Admin SELECT scores',
            'Allowed',
            'Denied',
            false
        );
    END;

    -- Test profiles table
    BEGIN
        -- SELECT should succeed
        PERFORM COUNT(*) FROM public.profiles;
        PERFORM log_test_result(
            'Admin SELECT profiles',
            'Allowed',
            'Allowed',
            true
        );
    EXCEPTION WHEN OTHERS THEN
        PERFORM log_test_result(
            'Admin SELECT profiles',
            'Allowed',
            'Denied',
            false
        );
    END;
END $$; 