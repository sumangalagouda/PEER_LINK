from flask import Blueprint,request,jsonify,current_app

from extensions import mysql

profile_bp=Blueprint('profile',__name__)


@profile_bp.route('/view/<int:id>', methods=['GET'])
def profile_view(id):
    cursor=mysql.connection.cursor()
    cursor.execute('SELECT ID,NAME,EMAIL,SCHOOL,SKILLS,INTEREST FROM REGISTRATION WHERE id=%s',(id,))
    user=cursor.fetchone()
    cursor.close()

    if user:
        return jsonify({'status':'success','profile':user})
    else:
        return jsonify({'message':'User not found'}),404


@profile_bp.route('/Edit/<int:id>', methods=['PUT'])
def profile_Edit(id):
    data = request.json
    name = data.get('name')
    email = data.get('email')
    school = data.get('school')
    skills = data.get('skills')
    interest = data.get('interest')
    cursor=mysql.connection.cursor()
    cursor.execute('UPDATE REGISTRATION SET name=%s, school=%s, skills=%s, interest=%s WHERE id=%s',(name,school,skills,interest,id))

    mysql.connection.commit()
    cursor.close()
    return jsonify({'status':'success','message':'Profile updated successfully'})

