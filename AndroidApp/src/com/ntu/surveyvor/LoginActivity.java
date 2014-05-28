package com.ntu.surveyvor;

import java.io.IOException;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

import android.os.AsyncTask;
import android.os.Bundle;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Intent;
import android.view.Menu;
import android.view.View;
import android.widget.EditText;

public class LoginActivity extends Activity {
	
	private AlertDialog alertDialog;
	private ProgressDialog progressDialog;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        alertDialog = new AlertDialog.Builder(this).create();
        progressDialog = new ProgressDialog(LoginActivity.this);
        
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_login, menu);
        return true;
    }
    
    public void onClickForgotPassword(View v) {
    	Intent intent = new Intent(this, ForgotPassword.class);
        startActivity(intent);
    }

    public void onClickLogin(View v) {
    	LoginTask task = new LoginTask();
    	EditText username= (EditText) findViewById(R.id.username);
    	EditText password = (EditText) findViewById(R.id.password);
		task.execute("account/login/", "username="+username.getText().toString()+"&password="+password.getText().toString());

    }
    
    public void onClickRegister(View v) {
    	Intent intent = new Intent(this, RegisterActivity.class);
        startActivity(intent);
    }
    
    private class LoginTask extends AsyncTask<String, Void, String> {

    	@Override
    	protected String doInBackground(String... params) {
    		String relativeUrl = params[0];
    		String postQuery = params[1];
    		try {
    			return ServerComm.getJsonWithPost(relativeUrl, postQuery);
    		} catch (IOException e) {
    			// TODO Auto-generated catch block
    			e.printStackTrace();
    			return null;
    		}
    	}
    	
    	@Override
        protected void onPreExecute()
        {
            progressDialog.setMessage("Please wait...");
            progressDialog.show();
        }
    	
    	protected void onPostExecute(String jsonString) {
        	JSONObject object;
			try {
				object = (JSONObject) new JSONTokener(jsonString).nextValue();
			
				if(object.getBoolean("login_failure")){
					alertDialog.setMessage("The username and password do not match!");
					alertDialog.show();
				}
				else{
					Intent intent = new Intent(LoginActivity.this, Profile.class);
			        startActivity(intent);
				}
				progressDialog.dismiss();
				
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }

    }
}
