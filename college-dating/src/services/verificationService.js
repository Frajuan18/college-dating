// src/services/verificationService.js
import { supabase } from '../lib/supabaseClient';

export const submitVerification = async (formData) => {
  try {
    console.log('Submitting verification data:', formData);

    // Get telegram data
    const telegramData = formData.telegramData || {};
    const telegramId = telegramData.id || formData.telegramId;
    
    if (!telegramId) {
      throw new Error('No Telegram ID found');
    }

    // 1. Insert into users table
    const userData = {
      telegram_id: telegramId,
      telegram_username: telegramData.username || formData.telegramUsername || null,
      first_name: telegramData.first_name || formData.firstName || 'Unknown',
      last_name: telegramData.last_name || formData.lastName || '',
      photo_url: telegramData.photo_url || null
    };

    console.log('Inserting user:', userData);

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (userError) {
      // If user already exists, get the existing user
      if (userError.code === '23505') { // Unique violation
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('telegram_id', telegramId)
          .single();
        
        if (existingUser) {
          user = existingUser;
        } else {
          throw userError;
        }
      } else {
        throw userError;
      }
    }

    console.log('User saved:', user);

    // 2. Insert into student_verifications table
    const verificationData = {
      user_id: user.id,
      university_name: formData.universityName,
      student_id: formData.studentId,
      graduation_year: parseInt(formData.graduationYear),
      gender: formData.gender,
      status: 'pending',
      submitted_at: new Date().toISOString()
    };

    // Upload photo if exists
    if (formData.idPhoto) {
      try {
        const fileExt = formData.idPhoto.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('student-ids')
          .upload(fileName, formData.idPhoto);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('student-ids')
            .getPublicUrl(fileName);

          verificationData.id_photo_url = publicUrl;
          verificationData.id_photo_path = fileName;
        }
      } catch (uploadError) {
        console.error('Photo upload failed:', uploadError);
      }
    }

    console.log('Inserting verification:', verificationData);

    const { data: verification, error: verificationError } = await supabase
      .from('student_verifications')
      .insert([verificationData])
      .select();

    if (verificationError) {
      throw verificationError;
    }

    console.log('Verification saved:', verification);

    return { 
      success: true, 
      message: 'Verification submitted successfully!', 
      user,
      verification 
    };
  } catch (error) {
    console.error('Error submitting verification:', error);
    return { success: false, message: error.message };
  }
};