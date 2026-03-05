// pages/api/verify-student.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // First, check if user exists or create new user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', formData.telegramId)
      .single();

    if (!user) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          telegram_id: formData.telegramId,
          telegram_username: formData.telegramUsername,
          first_name: formData.firstName,
          last_name: formData.lastName
        }])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    // Handle file upload to Supabase Storage
    let idPhotoUrl = null;
    let idPhotoPath = null;
    
    if (req.files?.idPhoto) {
      const file = req.files.idPhoto;
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-ids')
        .upload(fileName, file.data, {
          contentType: file.mimetype
        });

      if (uploadError) throw uploadError;

      idPhotoPath = uploadData.path;
      
      const { data: { publicUrl } } = supabase.storage
        .from('student-ids')
        .getPublicUrl(fileName);

      idPhotoUrl = publicUrl;
    }

    // Create verification record
    const { data: verification, error: verificationError } = await supabase
      .from('student_verifications')
      .insert([{
        user_id: user.id,
        university_name: formData.universityName,
        student_id: formData.studentId,
        graduation_year: formData.graduationYear,
        gender: formData.gender,
        id_photo_url: idPhotoUrl,
        id_photo_path: idPhotoPath,
        status: 'pending'
      }])
      .select();

    if (verificationError) throw verificationError;

    res.status(200).json({ 
      message: 'Verification request submitted successfully!',
      verification 
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
}